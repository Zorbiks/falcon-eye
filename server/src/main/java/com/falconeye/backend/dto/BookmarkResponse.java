package com.falconeye.backend.dto;

import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.models.Bookmark;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookmarkResponse {

    private Long id;
    private String rowKey;
    private LocalDateTime createdAt;
    private AcledEvent event; // enriched from HBase, null if not found

    public static BookmarkResponse from(Bookmark bookmark) {
        BookmarkResponse dto = new BookmarkResponse();
        dto.setId(bookmark.getId());
        dto.setRowKey(bookmark.getRowKey());
        dto.setCreatedAt(bookmark.getCreatedAt());
        return dto;
    }
}