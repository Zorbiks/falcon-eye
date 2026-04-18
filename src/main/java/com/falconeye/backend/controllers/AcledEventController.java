package com.falconeye.backend.controllers;

import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.models.CountryStats;
import com.falconeye.backend.services.HBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*") // Important for React Integration later!
public class AcledEventController {

    @Autowired
    private HBaseService hbaseService;

    // Based on the Data Contract in the Integration Guide
    @GetMapping("/country/{countryName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')") // Both roles can view Intelligence
    public ResponseEntity<List<AcledEvent>> getCountryEvents(@PathVariable String countryName) {

        // Capitalize the first letter just in case the frontend sends "algeria" instead
        // of "Algeria"
        String formattedCountry = countryName.substring(0, 1).toUpperCase() + countryName.substring(1).toLowerCase();

        List<AcledEvent> events = hbaseService.getEventsByCountry(formattedCountry);

        if (events.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(events);
    }

    // Search Endpoint (Date Ranges)
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<AcledEvent>> searchEvents(
            @RequestParam String country,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String admin1,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String subEventType,
            @RequestParam(required = false) String disorderType) {

        String formattedCountry = country.substring(0, 1).toUpperCase() + country.substring(1).toLowerCase();
        List<AcledEvent> events = hbaseService.searchEventsByDateRange(
                formattedCountry, startDate, endDate, region, admin1, eventType, subEventType, disorderType);

        if (events.isEmpty())
            return ResponseEntity.noContent().build();
        return ResponseEntity.ok(events);
    }

    // Stats Dashboard Endpoint
    @GetMapping("/stats/{countryName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<CountryStats> getStats(@PathVariable String countryName) {

        String formattedCountry = countryName.substring(0, 1).toUpperCase() + countryName.substring(1).toLowerCase();
        CountryStats stats = hbaseService.getCountryStats(formattedCountry);

        return ResponseEntity.ok(stats);
    }
}