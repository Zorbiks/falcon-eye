package com.falconeye.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CountryStats {
    private String country;
    private int totalEvents;
    private int totalFatalities;
}