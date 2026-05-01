"""
RSS Fetcher — parses all configured feeds, merges and sorts by date,
writes a single JSON file to data/news.json.
"""

import json
import logging
import re
import time
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Optional
from xml.etree import ElementTree as ET

import requests

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Feed registry
# ---------------------------------------------------------------------------

FEEDS = [
    {"url": "https://www.theguardian.com/world/middleeast/rss",          "source": "The Guardian"},
    {"url": "https://www.jpost.com/rss/rssfeedsmiddleeastnews.aspx",     "source": "The Jerusalem Post"},
    {"url": "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",  "source": "BBC News"},
    {"url": "https://www.middleeasteye.net/rss",                         "source": "Middle East Eye"},
    {"url": "https://www.presstv.ir/rss/rss-102.xml",                   "source": "Press TV"},
    {"url": "https://www.middleeastmonitor.com/feed/",                   "source": "Middle East Monitor"},
    {"url": "https://www.france24.com/en/middle-east/rss",              "source": "France 24"},
    {"url": "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", "source": "The New York Times"},
    {"url": "https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml", "source": "UN News"},
    {"url": "https://feeds.content.dowjones.io/public/rss/RSSWorldNews", "source": "Wall Street Journal"},
    {"url": "https://timesofindia.indiatimes.com/rssfeeds/1898272.cms", "source": "Times of India"},
    {"url": "https://www.mintpressnews.com/feed/",                       "source": "MintPress News"},
    {"url": "https://mondoweiss.net/feed/",                              "source": "Mondoweiss"},
    {"url": "https://www.lemonde.fr/en/middle-east/rss_full.xml",       "source": "Le Monde"},
]

# XML namespaces commonly used in RSS feeds
NS = {
    "media":   "http://search.yahoo.com/mrss/",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc":      "http://purl.org/dc/elements/1.1/",
    "atom":    "http://www.w3.org/2005/Atom",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; NewsAggregator/1.0; "
        "+https://github.com/your-org/mideast-news)"
    )
}

TAG_RE = re.compile(r"<[^>]+>")


def strip_tags(text: str) -> str:
    """Remove HTML/XML tags and collapse whitespace."""
    return TAG_RE.sub(" ", text or "").strip()


def parse_date(raw: Optional[str]) -> Optional[str]:
    """
    Return an ISO-8601 UTC string or None.
    Handles RFC-2822 (RSS pubDate), W3C/ISO dates, and common variants.
    """
    if not raw:
        return None
    raw = raw.strip()
    # Try RFC-2822 first (most RSS feeds)
    try:
        dt = parsedate_to_datetime(raw)
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        pass
    # Try ISO-8601 variants
    for fmt in (
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(raw, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            pass
    logger.debug("Could not parse date: %r", raw)
    return None


def find_image(item: ET.Element) -> Optional[str]:
    """
    Try several common RSS patterns to find an image URL.
    Priority: media:content > media:thumbnail > enclosure > content:encoded img > description img
    """
    # media:content url="..." or media:thumbnail url="..."
    for local in ("content", "thumbnail"):
        el = item.find(f"{{{NS['media']}}}{local}")
        if el is not None:
            url = el.get("url")
            if url:
                return url

    # <enclosure url="..." type="image/..."/>
    enc = item.find("enclosure")
    if enc is not None and (enc.get("type", "").startswith("image") or
                             enc.get("url", "").lower().endswith(
                                 (".jpg", ".jpeg", ".png", ".webp", ".gif"))):
        url = enc.get("url")
        if url:
            return url

    # content:encoded — look for first <img src="...">
    content_el = item.find(f"{{{NS['content']}}}encoded")
    if content_el is not None and content_el.text:
        m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content_el.text)
        if m:
            return m.group(1)

    # description HTML — some feeds embed <img> in the description
    desc_el = item.find("description")
    if desc_el is not None and desc_el.text:
        m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', desc_el.text)
        if m:
            return m.group(1)

    return None


def text(item: ET.Element, tag: str) -> str:
    """Return HTML-stripped text of a direct child tag, or ''."""
    el = item.find(tag)
    return strip_tags(el.text or "") if el is not None else ""


def raw_text(item: ET.Element, tag: str) -> str:
    """Return raw unstripped text of a child tag (use for dates, links)."""
    el = item.find(tag)
    return (el.text or "").strip() if el is not None else ""


# ---------------------------------------------------------------------------
# Core fetch + parse
# ---------------------------------------------------------------------------

def fetch_feed(feed_meta: dict, timeout: int = 15) -> list[dict]:
    url = feed_meta["url"]
    source = feed_meta["source"]
    articles = []

    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
    except requests.RequestException as exc:
        logger.warning("Network error fetching %s: %s", url, exc)
        return []
    except ET.ParseError as exc:
        logger.warning("XML parse error for %s: %s", url, exc)
        return []

    # Support both RSS (<channel><item>) and Atom (<feed><entry>) — but all
    # given feeds are RSS, so we focus there and fall back gracefully.
    channel = root.find("channel")
    items = channel.findall("item") if channel is not None else root.findall("item")

    for item in items:
        title = text(item, "title")
        # <link> is sometimes empty text with the URL in .tail (Guardian, BBC)
        link_el = item.find("link")
        link = ""
        if link_el is not None:
            link = (link_el.text or "").strip() or (link_el.tail or "").strip()
        if not link:
            # atom:link rel=alternate
            for a in item.findall(f"{{{NS['atom']}}}link"):
                if a.get("rel", "alternate") == "alternate":
                    link = a.get("href", "")
                    break

        desc  = strip_tags(text(item, "description"))

        # Use raw_text for dates — strip_tags mangles RFC-2822 strings
        pub_raw = (raw_text(item, "pubDate")
                   or raw_text(item, f"{{{NS['dc']}}}date")
                   or raw_text(item, "dc:date"))
        pub = parse_date(pub_raw)

        img = find_image(item)

        if not title or not link:
            continue

        articles.append({
            "title":       title,
            "link":        link,
            "description": desc or None,
            "source":      source,
            "publishedAt": pub,
            "imageUrl":    img,
        })

    logger.info("Fetched %d articles from %s", len(articles), source)
    return articles


def fetch_all_feeds() -> list[dict]:
    """Fetch every feed, merge, deduplicate by link, sort newest-first."""
    all_articles: list[dict] = []

    for feed_meta in FEEDS:
        all_articles.extend(fetch_feed(feed_meta))

    # Deduplicate by canonical link
    seen: set[str] = set()
    unique: list[dict] = []
    for art in all_articles:
        key = art["link"].rstrip("/")
        if key not in seen:
            seen.add(key)
            unique.append(art)

    # Sort: articles with a date first (newest → oldest), then undated
    def sort_key(a: dict):
        if a["publishedAt"]:
            return (0, a["publishedAt"])
        return (1, "")

    unique.sort(key=sort_key, reverse=False)
    unique.sort(key=lambda a: (0 if a["publishedAt"] else 1,
                                a["publishedAt"] or ""),
                reverse=True)

    return unique


# ---------------------------------------------------------------------------
# Write output
# ---------------------------------------------------------------------------

OUTPUT_PATH = Path(__file__).parent / "data" / "news.json"


def write_json(articles: list[dict]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "count":     len(articles),
        "articles":  articles,
    }
    tmp = OUTPUT_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(OUTPUT_PATH)  # atomic rename
    logger.info("Wrote %d articles to %s", len(articles), OUTPUT_PATH)


# ---------------------------------------------------------------------------
# Entry-point (also importable by the scheduler)
# ---------------------------------------------------------------------------

def run_once() -> None:
    logger.info("Starting RSS fetch cycle…")
    t0 = time.monotonic()
    articles = fetch_all_feeds()
    write_json(articles)
    logger.info("Cycle complete in %.1fs — %d articles", time.monotonic() - t0, len(articles))


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s %(levelname)-8s %(message)s")
    run_once()
