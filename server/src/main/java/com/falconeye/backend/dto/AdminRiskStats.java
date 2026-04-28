package com.falconeye.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRiskStats {
    private String admin1;
    private int totalEvents;
    private int totalFatalities;
    private double totalPopExposure;
    private double riskScore; // popExposure * fatalities normalized
}