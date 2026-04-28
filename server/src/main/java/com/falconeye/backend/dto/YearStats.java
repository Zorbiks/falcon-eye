package com.falconeye.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YearStats {
    private int year;
    private int totalEvents;
    private int totalFatalities;
}