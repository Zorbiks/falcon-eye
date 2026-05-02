package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.AdminRiskStats;
import com.falconeye.backend.dto.EventTypeStats;
import com.falconeye.backend.dto.MessageResponse;
import com.falconeye.backend.dto.RegionCountryStats;
import com.falconeye.backend.dto.YearStats;
import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.models.CountryStats;
import com.falconeye.backend.services.HBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    public ResponseEntity<?> getCountryEvents(@PathVariable String countryName) {
        String formattedCountry = titleCase(countryName);
        List<AcledEvent> events = hbaseService.getEventsByCountry(formattedCountry);

        if (events.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse("No events found for country: " + formattedCountry));
        }

        return ResponseEntity.ok(events);
    }

    /**
     * Search endpoint — returns events for a given year and month, with an optional
     * country filter.
     *
     * If NO parameters are provided: returns all events from every country for
     * the latest year and month present in the dataset.
     *
     * If parameters ARE provided: year and month are required; country is optional.
     * - With country: returns events for that country in the given year/month.
     * - Without country: returns all events in the given year/month.
     *
     * Example: GET /api/events/search
     * Example: GET /api/events/search?year=2015&month=12
     * Example: GET /api/events/search?country=israel&year=2015&month=12
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchEvents(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String country) {

        boolean hasYear = year != null;
        boolean hasMonth = month != null;
        boolean hasCountry = country != null && !country.isBlank();

        // No params → default to the latest year-month in the dataset (all countries)
        if (!hasYear && !hasMonth && !hasCountry) {
            LocalDate latestDate = hbaseService.getLatestDateInDatabase();
            YearMonth latest = YearMonth.from(latestDate);
            String startDate = latest.atDay(1).toString();
            String endDate = latest.atEndOfMonth().toString();
            List<AcledEvent> events = hbaseService.searchEvents(null, startDate, endDate);
            if (events.isEmpty()) {
                return ResponseEntity.ok(new MessageResponse(
                        "No events found for the latest period (" + latest + ")."));
            }
            return ResponseEntity.ok(events);
        }

        // Year and month are required; reject if either is missing
        if (!hasYear || !hasMonth) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                    "Error: year and month are required. country is optional."));
        }

        // Validate ranges
        if (month < 1 || month > 12) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: month must be between 1 and 12."));
        }
        if (year < 1900 || year > 2100) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: year value is out of valid range."));
        }

        YearMonth yearMonth = YearMonth.of(year, month);
        String startDate = yearMonth.atDay(1).toString();
        String endDate = yearMonth.atEndOfMonth().toString();

        // country is optional — pass null to get all countries for the given period
        String formattedCountry = hasCountry ? titleCase(country) : null;

        List<AcledEvent> events = hbaseService.searchEvents(formattedCountry, startDate, endDate);

        if (events.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse("No events found for the given search criteria."));
        }

        return ResponseEntity.ok(events);
    }

    // GET /api/events/stats/{countryName}
    @GetMapping("/stats/{countryName}")
    public ResponseEntity<?> getStats(@PathVariable String countryName) {
        String formattedCountry = titleCase(countryName);
        CountryStats stats = hbaseService.getCountryStats(formattedCountry);

        if (stats == null) {
            return ResponseEntity.ok(new MessageResponse("No statistics found for country: " + formattedCountry));
        }

        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/events/stats/{country}/by-year
     * Optional: ?start=YYYY-MM-DD&end=YYYY-MM-DD
     */
    @GetMapping("/stats/{countryName}/by-year")
    public ResponseEntity<?> getStatsByYear(
            @PathVariable String countryName,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        String country = titleCase(countryName);
        List<YearStats> stats = hbaseService.getStatsByYear(country, start, end);
        if (stats.isEmpty())
            return ResponseEntity.ok(new MessageResponse("No data found for country: " + country));
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/events/stats/{country}/by-type
     * Optional: ?start=YYYY-MM-DD&end=YYYY-MM-DD
     */
    @GetMapping("/stats/{countryName}/by-type")
    public ResponseEntity<?> getStatsByEventType(
            @PathVariable String countryName,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        String country = titleCase(countryName);
        List<EventTypeStats> stats = hbaseService.getStatsByEventType(country, start, end);
        if (stats.isEmpty())
            return ResponseEntity.ok(new MessageResponse("No data found for country: " + country));
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/events/stats/{country}/risk
     * Ranks admin1 regions by risk score (fatalities * popExposure).
     * Optional: ?start=YYYY-MM-DD&end=YYYY-MM-DD
     */
    @GetMapping("/stats/{countryName}/risk")
    public ResponseEntity<?> getRiskByAdmin1(
            @PathVariable String countryName,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        String country = titleCase(countryName);
        List<AdminRiskStats> stats = hbaseService.getRiskByAdmin1(country, start, end);
        if (stats.isEmpty())
            return ResponseEntity.ok(new MessageResponse("No data found for country: " + country));
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/events/stats/region/{regionName}
     * Aggregates all countries within a region, ranked by total events.
     */
    @GetMapping("/stats/region/{regionName}")
    public ResponseEntity<?> getStatsByRegion(@PathVariable String regionName) {
        String region = titleCase(regionName);
        List<RegionCountryStats> stats = hbaseService.getStatsByRegion(region);
        if (stats.isEmpty())
            return ResponseEntity.ok(new MessageResponse("No data found for region: " + region));
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