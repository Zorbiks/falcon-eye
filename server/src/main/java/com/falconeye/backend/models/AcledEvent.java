package com.falconeye.backend.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcledEvent {
    // e.g., "Morocco#2020-August-01#2031.0"
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
    private Integer events;      // cf:events  — number of events in this record
    private Double popExposure;  // cf:pop_exposure

    public boolean isCritical() {
        return this.fatalities != null && this.fatalities > 5;
    }
}
