package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.NewsItem;
import com.falconeye.backend.services.RssFeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoint for the news feed.
 *
 * GET /api/news/feed is publicly accessible — no authentication required.
 * Guests can browse the news feed without logging in.
 *
 * GET /api/news/feed
 *   Returns a JSON array of news items from all registered RSS sources,
 *   sorted newest-first.
 *
 * Example response:
 * [
 *   {
 *     "title": "...",
 *     "link": "https://...",
 *     "description": "...",
 *     "source": "Al Jazeera",
 *     "publishedAt": "2026-04-21T10:30:00Z",
 *     "imageUrl": null
 *   },
 *   ...
 * ]
 */
@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsFeedController {

    @Autowired
    private RssFeedService rssFeedService;

    /**
     * Fetch and return the merged, date-sorted news feed.
     * Publicly accessible — no authentication required.
     */
    @GetMapping("/feed")
    public ResponseEntity<List<NewsItem>> getNewsFeed() {
        List<NewsItem> items = rssFeedService.fetchAll();
        return ResponseEntity.ok(items);
    }
}
