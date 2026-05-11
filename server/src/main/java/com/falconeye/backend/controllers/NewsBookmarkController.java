package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.MessageResponse;
import com.falconeye.backend.models.NewsBookmark;
import com.falconeye.backend.services.NewsBookmarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bookmarks/news")
public class NewsBookmarkController {

    @Autowired
    private NewsBookmarkService newsBookmarkService;

    // POST /api/bookmarks/news
    // Body: full news object JSON
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addBookmark(Authentication auth, @RequestBody NewsBookmark newsItem) {
        if (newsItem.getLink() == null || newsItem.getLink().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("link is required."));
        }

        return newsBookmarkService.addBookmark(auth.getName(), newsItem)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(new MessageResponse("User not found.")));
    }

    // DELETE /api/bookmarks/news
    // Body: { "link": "https://..." }
    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> removeBookmark(Authentication auth, @RequestBody Map<String, String> body) {
        String link = body.get("link");
        if (link == null || link.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("link is required."));
        }

        boolean removed = newsBookmarkService.removeBookmark(auth.getName(), link);
        if (!removed) {
            return ResponseEntity.status(404).body(new MessageResponse("Bookmark not found for link: " + link));
        }

        return ResponseEntity.ok(new MessageResponse("Bookmark removed successfully."));
    }

    // GET /api/bookmarks/news
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getMyBookmarks(Authentication auth) {
        return newsBookmarkService.getMyBookmarks(auth.getName())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(new MessageResponse("User not found.")));
    }

    // GET /api/bookmarks/news/check?link=https://...
    @GetMapping("/check")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> checkBookmark(Authentication auth, @RequestParam String link) {
        return newsBookmarkService.isBookmarked(auth.getName(), link)
                .<ResponseEntity<?>>map(bookmarked -> ResponseEntity.ok(Map.of("bookmarked", bookmarked)))
                .orElse(ResponseEntity.status(404).body(new MessageResponse("User not found.")));
    }
}
