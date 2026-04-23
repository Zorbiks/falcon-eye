package com.falconeye.backend.services;

import com.falconeye.backend.dto.NewsItem;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RssFeedService {

    private static final Logger log = LoggerFactory.getLogger(RssFeedService.class);

    /**
     * Static registry of feeds.
     * Key   = human-readable source label shown in the API response.
     * Value = RSS/Atom feed URL.
     *
     * To add more feeds in the future, simply insert a new entry here.
     */
    private static final Map<String, String> FEED_SOURCES = new LinkedHashMap<>();

    static {
        // The Guardian – Middle East section
        FEED_SOURCES.put("The Guardian", "https://www.theguardian.com/world/middleeast/rss");

        // Al Jazeera – Middle East section
        FEED_SOURCES.put("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml");
    }

    /**
     * Fetches every registered feed, merges the items, and returns them
     * sorted newest-first.
     *
     * @return immutable list of {@link NewsItem}, most recent first.
     */
    public List<NewsItem> fetchAll() {
        List<NewsItem> allItems = new ArrayList<>();

        for (Map.Entry<String, String> entry : FEED_SOURCES.entrySet()) {
            String sourceName = entry.getKey();
            String feedUrl   = entry.getValue();
            try {
                allItems.addAll(parseFeed(sourceName, feedUrl));
            } catch (Exception e) {
                // Log and continue so that one broken feed never kills the whole response
                log.error("Failed to fetch RSS feed '{}' from {}: {}", sourceName, feedUrl, e.getMessage());
            }
        }

        // Sort newest first; items without a date are pushed to the end
        allItems.sort(Comparator.comparing(NewsItem::getPublishedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return Collections.unmodifiableList(allItems);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private List<NewsItem> parseFeed(String sourceName, String feedUrl) throws Exception {
        SyndFeedInput input = new SyndFeedInput();
        // Allow fetching via plain HTTP as well as HTTPS
        input.setAllowDoctypes(false);

        try (XmlReader reader = new XmlReader(new URL(feedUrl))) {
            SyndFeed feed = input.build(reader);

            return feed.getEntries().stream()
                    .map(entry -> toNewsItem(entry, sourceName))
                    .collect(Collectors.toList());
        }
    }

    private NewsItem toNewsItem(SyndEntry entry, String sourceName) {
        NewsItem item = new NewsItem();
        item.setSource(sourceName);
        item.setTitle(entry.getTitle());
        item.setLink(entry.getLink());

        // Plain-text description – strip any embedded HTML tags
        if (entry.getDescription() != null) {
            String raw = entry.getDescription().getValue();
            item.setDescription(raw != null ? raw.replaceAll("<[^>]+>", "").trim() : null);
        }

        // Published date – fall back to updated date when publishedDate is absent
        Date date = entry.getPublishedDate() != null
                ? entry.getPublishedDate()
                : entry.getUpdatedDate();
        item.setPublishedAt(date != null ? date.toInstant() : null);

        // Best-effort thumbnail extraction from media:content or enclosure
        item.setImageUrl(extractImageUrl(entry));

        return item;
    }

    /**
     * Tries to extract a thumbnail URL from Rome's foreign-markup modules
     * (media:content, media:thumbnail) or from feed enclosures.
     */
    private String extractImageUrl(SyndEntry entry) {
        // Check enclosures first (podcasts / image enclosures)
        if (entry.getEnclosures() != null) {
            return entry.getEnclosures().stream()
                    .filter(e -> e.getType() != null && e.getType().startsWith("image/"))
                    .map(e -> e.getUrl())
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
        }

        // MediaModule is not available without the optional dependency; skip gracefully
        return null;
    }
}
