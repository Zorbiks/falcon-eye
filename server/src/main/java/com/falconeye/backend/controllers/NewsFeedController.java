package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.NewsItem;
import com.falconeye.backend.services.RssFeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoint for the news feed.
 *
 * All routes under /api/news require a valid JWT token (enforced by the global
 * SecurityConfig + JwtAuthenticationFilter). The @PreAuthorize annotation adds
 * an explicit role check on top of that, consistent with the rest of the API.
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
     * Accessible to both ADMIN and USER roles.
     */
    @GetMapping("/feed")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<NewsItem>> getNewsFeed() {
        List<NewsItem> items = rssFeedService.fetchAll();
        return ResponseEntity.ok(items);
    }
}
