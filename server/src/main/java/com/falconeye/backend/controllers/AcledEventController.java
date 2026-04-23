package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.MessageResponse;
import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.models.CountryStats;
import com.falconeye.backend.services.HBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class AcledEventController {

    @Autowired
    private HBaseService hbaseService;

    // GET /api/events/country/{countryName}
    @GetMapping("/country/{countryName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getCountryEvents(@PathVariable String countryName) {
        String formattedCountry = titleCase(countryName);
        List<AcledEvent> events = hbaseService.getEventsByCountry(formattedCountry);

        if (events.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse("No events found for country: " + formattedCountry));
        }

        return ResponseEntity.ok(events);
    }

    /**
     * Search endpoint with condensed parameters.
     * Optional: country, startDate, endDate (YYYY-MM-DD)
     */
@GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> searchEvents(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date) {

        // 1. Dynamically calculate the last 30 days OF THE ACTUAL DATA
        if (start_date == null && end_date == null) {
            LocalDate latestDbDate = hbaseService.getLatestDateInDatabase();
            end_date = latestDbDate.toString();                  
            start_date = latestDbDate.minusDays(30).toString();  
        } 
        // 2. Prevent incomplete date searches
        else if (start_date == null || end_date == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Both start_date and end_date must be provided together."));
        }

        // 3. Format the country name (e.g., "mauritania" -> "Mauritania")
        String formattedCountry = (country != null && !country.isBlank()) ? titleCase(country) : null;

        // 4. Pass the parameters directly to your HBase service
        List<AcledEvent> events = hbaseService.searchEvents(formattedCountry, start_date, end_date);

        if (events.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse("No events found for the given search criteria."));
        }

        return ResponseEntity.ok(events);
    }

    
    // GET /api/events/stats/{countryName}
    @GetMapping("/stats/{countryName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getStats(@PathVariable String countryName) {
        String formattedCountry = titleCase(countryName);
        CountryStats stats = hbaseService.getCountryStats(formattedCountry);

        if (stats == null) {
            return ResponseEntity.ok(new MessageResponse("No statistics found for country: " + formattedCountry));
        }

        return ResponseEntity.ok(stats);
    }

    private String titleCase(String value) {
        if (value == null || value.isBlank())
            return value;
        return Arrays.stream(value.trim().split("\\s+"))
                .map(word -> word.isEmpty()
                        ? word
                        : Character.toUpperCase(word.charAt(0)) + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}