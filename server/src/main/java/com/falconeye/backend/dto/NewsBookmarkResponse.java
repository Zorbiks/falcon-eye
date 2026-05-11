package com.falconeye.backend.dto;

import com.falconeye.backend.models.NewsBookmark;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NewsBookmarkResponse {

    private Long id;
    private LocalDateTime createdAt;

    // Full news object fields
    private String link;
    private String title;
    private String description;
    private String source;
    private String publishedAt;
    private String imageUrl;

    public static NewsBookmarkResponse from(NewsBookmark bookmark) {
        NewsBookmarkResponse dto = new NewsBookmarkResponse();
        dto.setId(bookmark.getId());
        dto.setCreatedAt(bookmark.getCreatedAt());
        dto.setLink(bookmark.getLink());
        dto.setTitle(bookmark.getTitle());
        dto.setDescription(bookmark.getDescription());
        dto.setSource(bookmark.getSource());
        dto.setPublishedAt(bookmark.getPublishedAt());
        dto.setImageUrl(bookmark.getImageUrl());
        return dto;
    }
}
