package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.CountryStats;
import com.falconeye.backend.dto.EventTypeStats;
import com.falconeye.backend.dto.MessageResponse;
import com.falconeye.backend.dto.RegionCountryStats;
import com.falconeye.backend.dto.YearStats;
import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.services.HBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> getCountryEvents(@PathVariable String countryName) {
        String formattedCountry = titleCase(countryName);
        List<AcledEvent> events = hbaseService.getEventsByCountry(formattedCountry);

        if (events.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse("No events found for country: " + formattedCountry));
        }

        return ResponseEntity.ok(events);
    }

    /**
     * Search endpoint — all five parameters are required.
     *
     * @param region    "all" or an exact region name
     * @param country   "all" or an exact country name
     * @param eventType "all" or an exact event_type value (param name: event-type)
     * @param from      start date (inclusive, format: YYYY-MM-DD)
     * @param to        end date (inclusive, format: YYYY-MM-DD)
     *
     *                  Example: GET
     *                  /api/events/search?region=all&country=all&event-type=all&from=2020-01-01&to=2020-12-31
     *                  Example: GET
     *                  /api/events/search?region=all&country=Israel&event-type=Battles&from=2023-01-01&to=2023-06-30
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchEvents(
            @RequestParam String region,
            @RequestParam String country,
            @RequestParam(name = "event-type") String eventType,
            @RequestParam String from,
            @RequestParam String to) {

        // Validate that none of the required params are blank
        if (region.isBlank() || country.isBlank() || eventType.isBlank()
                || from.isBlank() || to.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                    "Error: all parameters are required — region, country, event-type, from, to."));
        }

        // Validate date formats
        LocalDate fromDate, toDate;
        try {
            fromDate = LocalDate.parse(from);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                    "Error: 'from' date is invalid. Expected format: YYYY-MM-DD (e.g. 2020-05-09)."));
        }
        try {
            toDate = LocalDate.parse(to);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                    "Error: 'to' date is invalid. Expected format: YYYY-MM-DD (e.g. 2020-05-09)."));
        }

        if (fromDate.isAfter(toDate)) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                    "Error: 'from' date must not be after 'to' date."));
        }

        // No casing normalization needed here — HBaseService handles title-casing
        // country (for row-key matching) and uses case-insensitive regex filters
        // for region and event-type, so callers can pass any casing they like.
        List<AcledEvent> events = hbaseService.searchEvents(
                region.trim(), country.trim(), eventType.trim(), from, to);

        if (events.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse("No events found for the given search criteria."));
        }

        return ResponseEntity.ok(events);
    }

    /**
     * Returns all events that fall within the last 30 days of data present in
     * the dataset (not the current wall-clock date — the latest date recorded
     * in HBase).
     *
     * Example: GET /api/events/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentEvents() {
        LocalDate latestDate = hbaseService.getLatestDateInDatabase();
        LocalDate thirtyDaysAgo = latestDate.minusDays(30);

        String startDate = thirtyDaysAgo.toString();
        String endDate = latestDate.toString();

        List<AcledEvent> events = hbaseService.searchEvents(null, null, null, startDate, endDate);

        if (events.isEmpty()) {
            return ResponseEntity.ok(new MessageResponse(
                    "No events found in the last 30 days of data (up to " + latestDate + ")."));
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