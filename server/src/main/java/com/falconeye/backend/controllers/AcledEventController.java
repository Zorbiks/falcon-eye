package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.MessageResponse;
import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.models.CountryStats;
import com.falconeye.backend.services.HBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
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
     * Search endpoint — returns all events for a given year and month.
     * Required: year (e.g. 2015), month (1–12)
     * Optional: country
     *
     * Example: GET /api/events/search?year=2015&month=12
     * Example: GET /api/events/search?year=2015&month=12&country=israel
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> searchEvents(
            @RequestParam(required = true) Integer year,
            @RequestParam(required = true) Integer month,
            @RequestParam(required = false) String country) {

        // 1. Validate month range
        if (month < 1 || month > 12) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: month must be between 1 and 12."));
        }

        // 2. Validate year range
        if (year < 1900 || year > 2100) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: year value is out of valid range."));
        }

        // 3. Derive the full date range for the requested month
        YearMonth yearMonth = YearMonth.of(year, month);
        String startDate = yearMonth.atDay(1).toString();        // e.g. "2015-12-01"
        String endDate   = yearMonth.atEndOfMonth().toString();  // e.g. "2015-12-31"

        // 4. Format the country name (e.g., "mauritania" -> "Mauritania")
        String formattedCountry = (country != null && !country.isBlank()) ? titleCase(country) : null;

        // 5. Delegate to HBase service
        List<AcledEvent> events = hbaseService.searchEvents(formattedCountry, startDate, endDate);

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
