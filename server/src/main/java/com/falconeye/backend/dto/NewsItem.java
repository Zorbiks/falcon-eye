package com.falconeye.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsItem {

    private String title;
    private String link;
    private String description;
    private String source;       // e.g. "The Guardian", "Al Jazeera"
    private Instant publishedAt; // ISO-8601 UTC instant for easy sorting & display
    private String imageUrl;     // optional thumbnail, may be null
}
