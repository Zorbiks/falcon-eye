package com.falconeye.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventTypeStats {
    private String eventType;
    private int totalEvents;
    private int totalFatalities;
    private Map<String, Integer> subEventBreakdown; // subEventType -> count
}