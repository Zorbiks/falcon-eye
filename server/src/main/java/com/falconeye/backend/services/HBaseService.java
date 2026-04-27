package com.falconeye.backend.services;

import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.models.CountryStats;

import org.apache.hadoop.hbase.CompareOperator;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.util.Bytes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.apache.hadoop.hbase.filter.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HBaseService {

    @Autowired
    private Connection hbaseConnection;

    private static final String TABLE_NAME = "events";
    private static final byte[] CF = Bytes.toBytes("cf");

    // Cache the date so we only scan the 400k rows once!
    private LocalDate cachedLatestDate = null;

    // Fetches all events for a specific country using PrefixFilter.
    public List<AcledEvent> getEventsByCountry(String countryName) {
        List<AcledEvent> events = new ArrayList<>();

        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Scan scan = new Scan();
            scan.setFilter(new PrefixFilter(Bytes.toBytes(countryName + "#")));

            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    events.add(mapResultToEvent(result));
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error querying HBase for country: " + countryName, e);
        }

        return events;
    }

    // Direct lookup by rowKey — used by BookmarkService to enrich bookmarks with
    // event data.
    public Optional<AcledEvent> getEventByRowKey(String rowKey) {
        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Get get = new Get(Bytes.toBytes(rowKey));
            Result result = table.get(get);
            return result.isEmpty() ? Optional.empty() : Optional.of(mapResultToEvent(result));
        } catch (IOException e) {
            throw new RuntimeException("Error fetching event by rowKey: " + rowKey, e);
        }
    }

    /**
     * Finds the absolute latest date available in the ACLED dataset.
     */
    public LocalDate getLatestDateInDatabase() {
        // If we already found it, return it immediately without hitting HBase
        if (cachedLatestDate != null) {
            return cachedLatestDate;
        }

        LocalDate maxDate = LocalDate.MIN;

        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Scan scan = new Scan();
            // OPTIMIZATION: Only grab the 'week' column.
            // This saves massive amounts of RAM and network I/O.
            scan.addColumn(CF, Bytes.toBytes("week"));

            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    byte[] weekBytes = result.getValue(CF, Bytes.toBytes("week"));
                    if (weekBytes != null) {
                        try {
                            LocalDate eventDate = LocalDate.parse(Bytes.toString(weekBytes));
                            if (eventDate.isAfter(maxDate)) {
                                maxDate = eventDate;
                            }
                        } catch (Exception e) {
                            // Failsafe: Ignore rows with malformed dates
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error scanning HBase for latest date", e);
        }

        // Failsafe just in case the table is completely empty
        if (maxDate.equals(LocalDate.MIN)) {
            maxDate = LocalDate.now();
        }

        this.cachedLatestDate = maxDate; // Store it so it never runs again
        return maxDate;
    }

    /**
     * Unified search logic handling Country and Date ranges.
     */
    public List<AcledEvent> searchEvents(String country, String startDate, String endDate) {
        List<AcledEvent> events = new ArrayList<>();

        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Scan scan = new Scan();

            if (country != null) {
                // OPTIMIZED SCAN: If country is provided, we can use StartRow and StopRow.
                // RowKey format: Country#YYYY-MM-DD#ID
                // Example Start: Mauritania#1997-03-08
                // Example Stop: Mauritania#1997-10-25~ (The '~' ensures it includes everything
                // on the end date)
                byte[] startRow = Bytes.toBytes(country + "#" + startDate);
                byte[] stopRow = Bytes.toBytes(country + "#" + endDate + "~");

                scan.withStartRow(startRow);
                scan.withStopRow(stopRow);

            } else {
                // FULL TABLE SCAN: No country provided, we must check dates across all
                // countries.
                FilterList filterList = new FilterList(FilterList.Operator.MUST_PASS_ALL);

                // CompareOperator handles standard YYYY-MM-DD string sorting perfectly
                SingleColumnValueFilter startFilter = new SingleColumnValueFilter(
                        CF, Bytes.toBytes("week"), CompareOperator.GREATER_OR_EQUAL, Bytes.toBytes(startDate));
                startFilter.setFilterIfMissing(true); // Ignore rows that somehow lack a week column

                SingleColumnValueFilter endFilter = new SingleColumnValueFilter(
                        CF, Bytes.toBytes("week"), CompareOperator.LESS_OR_EQUAL, Bytes.toBytes(endDate));
                endFilter.setFilterIfMissing(true);

                filterList.addFilter(startFilter);
                filterList.addFilter(endFilter);

                scan.setFilter(filterList);
            }

            // Execute the scan
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    events.add(mapResultToEvent(result));
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error querying HBase for search", e);
        }

        return events;
    }

    // Aggregates statistics for a specific country dashboard.
    public CountryStats getCountryStats(String countryName) {
        List<AcledEvent> events = getEventsByCountry(countryName);

        if (events.isEmpty())
            return null;

        int totalEvents = 0;
        int totalFatalities = 0;

        for (AcledEvent event : events) {
            if (event.getFatalities() != null) {
                totalFatalities += event.getFatalities();
            }
            // Use the stored events count (number of sub-events) rather than
            // just counting rows, which gives more accurate aggregate totals.
            if (event.getEvents() != null) {
                totalEvents += event.getEvents();
            } else {
                totalEvents += 1;
            }
        }

        return new CountryStats(countryName, totalEvents, totalFatalities);
    }

    private AcledEvent mapResultToEvent(Result result) {
        AcledEvent event = new AcledEvent();
        event.setRowKey(Bytes.toString(result.getRow()));

        event.setWeek(getValueAsStr(result, "week"));
        event.setRegion(getValueAsStr(result, "region"));
        event.setCountry(getValueAsStr(result, "country"));
        event.setAdmin1(getValueAsStr(result, "admin1"));
        event.setEventType(getValueAsStr(result, "event_type"));
        event.setSubEventType(getValueAsStr(result, "sub_event_type"));
        event.setDisorderType(getValueAsStr(result, "disorder_type"));

        String fatalitiesStr = getValueAsStr(result, "fatalities");
        event.setFatalities(fatalitiesStr != null ? parseIntSafe(fatalitiesStr) : 0);

        String latStr = getValueAsStr(result, "latitude");
        event.setLatitude(latStr != null ? parseDoubleSafe(latStr) : null);

        String lonStr = getValueAsStr(result, "longitude");
        event.setLongitude(lonStr != null ? parseDoubleSafe(lonStr) : null);

        // BUG FIX: map previously missing cf:events and cf:pop_exposure columns
        String eventsStr = getValueAsStr(result, "events");
        event.setEvents(eventsStr != null ? parseIntSafe(eventsStr) : null);

        String popStr = getValueAsStr(result, "population_exposure");
        event.setPopExposure(popStr != null ? parseDoubleSafe(popStr) : null);

        return event;
    }

    private String getValueAsStr(Result result, String qualifier) {
        byte[] value = result.getValue(CF, Bytes.toBytes(qualifier));
        return value != null ? Bytes.toString(value) : null;
    }

    /**
     * Safely parse integers that may be stored as floats in HBase (e.g. "1.0").
     */
    private int parseIntSafe(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            // Value may be stored as a float string like "4.0"
            return (int) Double.parseDouble(s);
        }
    }

    private Double parseDoubleSafe(String s) {
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}