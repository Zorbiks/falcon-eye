package com.falconeye.backend.services;

import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.models.CountryStats;

import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.util.Bytes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class HBaseService {

    @Autowired
    private Connection hbaseConnection;

    // Constants based on the API Integration Guide
    private static final String TABLE_NAME = "acled_events";
    private static final byte[] CF = Bytes.toBytes("cf");

    /**
     * Fetches all events for a specific country using PrefixFilter.
     */
    public List<AcledEvent> getEventsByCountry(String countryName) {
        List<AcledEvent> events = new ArrayList<>();

        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {

            // Initialization hint from your partner's document
            Scan scan = new Scan();
            scan.setRowPrefixFilter(Bytes.toBytes(countryName + "#"));

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

    /**
     * Helper method to map an HBase Result to our JSON Model
     */
    private AcledEvent mapResultToEvent(Result result) {
        AcledEvent event = new AcledEvent();
        event.setRowKey(Bytes.toString(result.getRow()));

        // Extracting data from the "cf" column family
        event.setWeek(getValueAsStr(result, "week"));
        event.setRegion(getValueAsStr(result, "region"));
        event.setCountry(getValueAsStr(result, "country"));
        event.setAdmin1(getValueAsStr(result, "admin1"));
        event.setEventType(getValueAsStr(result, "eventType"));
        event.setSubEventType(getValueAsStr(result, "subEventType"));
        event.setDisorderType(getValueAsStr(result, "disorderType"));

        // Parse numeric fields safely
        String fatalitiesStr = getValueAsStr(result, "fatalities");
        event.setFatalities(fatalitiesStr != null ? Integer.parseInt(fatalitiesStr) : 0);

        String latStr = getValueAsStr(result, "latitude");
        event.setLatitude(latStr != null ? Double.parseDouble(latStr) : null);

        String lonStr = getValueAsStr(result, "longitude");
        event.setLongitude(lonStr != null ? Double.parseDouble(lonStr) : null);

        return event;
    }

    private String getValueAsStr(Result result, String qualifier) {
        byte[] value = result.getValue(CF, Bytes.toBytes(qualifier));
        return value != null ? Bytes.toString(value) : null;
    }

    /**
     * Searches events by date range using StartRow and StopRow optimizations.
     */
    public List<AcledEvent> searchEventsByDateRange(String country, String startDate, String endDate) {
        List<AcledEvent> events = new ArrayList<>();

        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Scan scan = new Scan();

            // Format: COUNTRY#WEEK#ID. We use dates to narrow the scan range.
            // A "~" is added to the end date to ensure it includes all IDs on that final
            // day.
            byte[] startRow = Bytes.toBytes(country + "#" + startDate);
            byte[] stopRow = Bytes.toBytes(country + "#" + endDate + "~");

            scan.withStartRow(startRow);
            scan.withStopRow(stopRow);

            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    events.add(mapResultToEvent(result));
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error searching HBase for range: " + startDate + " to " + endDate, e);
        }

        return events;
    }

    /**
     * Aggregates statistics for a specific country dashboard.
     */
    public CountryStats getCountryStats(String countryName) {
        // Reuse our existing prefix scan method to get all events
        List<AcledEvent> events = getEventsByCountry(countryName);

        int totalEvents = events.size();
        int totalFatalities = 0;

        // Calculate the sum of fatalities
        for (AcledEvent event : events) {
            if (event.getFatalities() != null) {
                totalFatalities += event.getFatalities();
            }
        }

        return new CountryStats(countryName, totalEvents, totalFatalities);
    }
}