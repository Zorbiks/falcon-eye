package com.falconeye.backend.models;

import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AcledEvent {
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

    public boolean isCritical() {
        return this.fatalities != null && this.fatalities > 5;
    }
}