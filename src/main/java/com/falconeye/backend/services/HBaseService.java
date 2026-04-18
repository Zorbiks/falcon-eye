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
import java.util.ArrayList;
import java.util.List;

@Service
public class HBaseService {

    @Autowired
    private Connection hbaseConnection;

    // Constants based on the API Integration Guide
    private static final String TABLE_NAME = "acled_events";
    private static final byte[] CF = Bytes.toBytes("cf");

    // Fetches all events for a specific country using PrefixFilter.
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

    // Helper method to map an HBase Result to our JSON Model
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

    // Searches events by date range using StartRow and StopRow optimizations.
    public List<AcledEvent> searchEventsByDateRange(String country, String startDate, String endDate,
            String region, String admin1, String eventType, String subEventType, String disorderType) {
        List<AcledEvent> events = new ArrayList<>();

        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Scan scan = new Scan();
            scan.withStartRow(Bytes.toBytes(country + "#" + startDate));
            scan.withStopRow(Bytes.toBytes(country + "#" + endDate + "~"));

            FilterList filters = new FilterList(FilterList.Operator.MUST_PASS_ALL);

            if (region != null)
                filters.addFilter(new SingleColumnValueFilter(CF, Bytes.toBytes("region"), CompareOperator.EQUAL,
                        Bytes.toBytes(region)));
            if (admin1 != null)
                filters.addFilter(new SingleColumnValueFilter(CF, Bytes.toBytes("admin1"), CompareOperator.EQUAL,
                        Bytes.toBytes(admin1)));
            if (eventType != null)
                filters.addFilter(new SingleColumnValueFilter(CF, Bytes.toBytes("eventType"), CompareOperator.EQUAL,
                        Bytes.toBytes(eventType)));
            if (subEventType != null)
                filters.addFilter(new SingleColumnValueFilter(CF, Bytes.toBytes("subEventType"), CompareOperator.EQUAL,
                        Bytes.toBytes(subEventType)));
            if (disorderType != null)
                filters.addFilter(new SingleColumnValueFilter(CF, Bytes.toBytes("disorderType"), CompareOperator.EQUAL,
                        Bytes.toBytes(disorderType)));

            if (!filters.getFilters().isEmpty())
                scan.setFilter(filters);

            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner)
                    events.add(mapResultToEvent(result));
            }
        } catch (IOException e) {
            throw new RuntimeException("Error searching HBase", e);
        }
        return events;
    }

    // Aggregates statistics for a specific country dashboard.
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