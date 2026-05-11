package com.falconeye.backend.dto;

import com.falconeye.backend.models.EventsBookmark;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookmarkResponse {

    private Long id;
    private LocalDateTime createdAt;

    // Full event data (mirrors AcledEvent fields)
    private String rowKey;
    private String week;
    private String region;
    private String country;
    private String admin1;
    private String eventType;
    private String subEventType;
    private Integer fatalities;
    private Double latitude;
    private Double longitude;
    private String disorderType;
    private Integer events;
    private Double popExposure;
    private Boolean critical;

    public static BookmarkResponse from(EventsBookmark bookmark) {
        BookmarkResponse dto = new BookmarkResponse();
        dto.setId(bookmark.getId());
        dto.setCreatedAt(bookmark.getCreatedAt());
        dto.setRowKey(bookmark.getRowKey());
        dto.setWeek(bookmark.getWeek());
        dto.setRegion(bookmark.getRegion());
        dto.setCountry(bookmark.getCountry());
        dto.setAdmin1(bookmark.getAdmin1());
        dto.setEventType(bookmark.getEventType());
        dto.setSubEventType(bookmark.getSubEventType());
        dto.setFatalities(bookmark.getFatalities());
        dto.setLatitude(bookmark.getLatitude());
        dto.setLongitude(bookmark.getLongitude());
        dto.setDisorderType(bookmark.getDisorderType());
        dto.setEvents(bookmark.getEvents());
        dto.setPopExposure(bookmark.getPopExposure());
        dto.setCritical(bookmark.getCritical());
        return dto;
    }
}