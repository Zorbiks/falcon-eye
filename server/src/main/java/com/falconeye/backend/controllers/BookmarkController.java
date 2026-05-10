package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.MessageResponse;
import com.falconeye.backend.services.BookmarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    // POST /api/bookmarks
    // Body: { "rowKey": "Morocco#01-April-2006#2032.0" }
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> addBookmark(Authentication auth, @RequestBody Map<String, String> body) {
        String rowKey = body.get("rowKey");
        if (rowKey == null || rowKey.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("rowKey is required."));
        }

        return bookmarkService.addBookmark(auth.getName(), rowKey)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(new MessageResponse("User not found.")));
    }

    // DELETE /api/bookmarks
    // Body: { "rowKey": "Morocco#01-April-2006#2032.0" }
    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> removeBookmark(Authentication auth, @RequestBody Map<String, String> body) {
        String rowKey = body.get("rowKey");
        if (rowKey == null || rowKey.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("rowKey is required."));
        }

        boolean removed = bookmarkService.removeBookmark(auth.getName(), rowKey);
        if (!removed) {
            return ResponseEntity.status(404).body(new MessageResponse("Bookmark not found for rowKey: " + rowKey));
        }

        return ResponseEntity.ok(new MessageResponse("Bookmark removed successfully."));
    }

    // GET /api/bookmarks
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getMyBookmarks(Authentication auth) {
        return bookmarkService.getMyBookmarks(auth.getName())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(new MessageResponse("User not found.")));
    }

    // GET /api/bookmarks/check?rowKey=Morocco%2301-April-2006%232032.0
    @GetMapping("/check")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> checkBookmark(Authentication auth, @RequestParam String rowKey) {
        return bookmarkService.isBookmarked(auth.getName(), rowKey)
                .<ResponseEntity<?>>map(bookmarked -> ResponseEntity.ok(Map.of("bookmarked", bookmarked)))
                .orElse(ResponseEntity.status(404).body(new MessageResponse("User not found.")));
    }
}