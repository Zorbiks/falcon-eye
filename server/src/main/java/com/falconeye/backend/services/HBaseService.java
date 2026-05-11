package com.falconeye.backend.services;

import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.dto.AdminRiskStats;
import com.falconeye.backend.dto.CountryStats;
import com.falconeye.backend.dto.EventTypeStats;
import com.falconeye.backend.dto.RegionCountryStats;
import com.falconeye.backend.dto.YearStats;

import org.apache.hadoop.hbase.CompareOperator;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.client.coprocessor.AggregationClient;
import org.apache.hadoop.hbase.client.coprocessor.LongColumnInterpreter;
import org.apache.hadoop.hbase.filter.*;
import org.apache.hadoop.hbase.util.Bytes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HBaseService {

    @Autowired
    private Connection hbaseConnection;

    @Autowired
    private AggregationClient aggregationClient;

    private static final String TABLE_NAME = "events";
    private static final byte[] CF = Bytes.toBytes("cf");

    private LocalDate cachedLatestDate = null;

    // ==================== EVENT FETCHING (unchanged) ====================

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

    public Optional<AcledEvent> getEventByRowKey(String rowKey) {
        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Get get = new Get(Bytes.toBytes(rowKey));
            Result result = table.get(get);
            return result.isEmpty() ? Optional.empty() : Optional.of(mapResultToEvent(result));
        } catch (IOException e) {
            throw new RuntimeException("Error fetching event by rowKey: " + rowKey, e);
        }
    }

    public LocalDate getLatestDateInDatabase() {
        if (cachedLatestDate != null)
            return cachedLatestDate;
        LocalDate maxDate = LocalDate.MIN;
        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Scan scan = new Scan();
            scan.addColumn(CF, Bytes.toBytes("week"));
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    byte[] weekBytes = result.getValue(CF, Bytes.toBytes("week"));
                    if (weekBytes != null) {
                        try {
                            LocalDate eventDate = LocalDate.parse(Bytes.toString(weekBytes));
                            if (eventDate.isAfter(maxDate))
                                maxDate = eventDate;
                        } catch (Exception ignored) {
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error scanning HBase for latest date", e);
        }
        if (maxDate.equals(LocalDate.MIN))
            maxDate = LocalDate.now();
        cachedLatestDate = maxDate;
        return maxDate;
    }

    public List<AcledEvent> searchEvents(String region, String country,
            String eventType,
            String startDate, String endDate) {
        List<AcledEvent> events = new ArrayList<>();
        boolean hasCountry = country != null && !country.equalsIgnoreCase("all");
        boolean hasRegion = region != null && !region.equalsIgnoreCase("all");
        boolean hasType = eventType != null && !eventType.equalsIgnoreCase("all");

        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Scan scan = new Scan();
            if (hasCountry) {
                String normCountry = titleCase(country);
                byte[] startRow = Bytes.toBytes(normCountry + "#" + startDate);
                byte[] stopRow = Bytes.toBytes(normCountry + "#" + endDate + "~");
                scan.withStartRow(startRow);
                scan.withStopRow(stopRow);
            } else {
                FilterList fl = new FilterList(FilterList.Operator.MUST_PASS_ALL);
                SingleColumnValueFilter startFilter = new SingleColumnValueFilter(
                        CF, Bytes.toBytes("week"), CompareOperator.GREATER_OR_EQUAL, Bytes.toBytes(startDate));
                startFilter.setFilterIfMissing(true);
                SingleColumnValueFilter endFilter = new SingleColumnValueFilter(
                        CF, Bytes.toBytes("week"), CompareOperator.LESS_OR_EQUAL, Bytes.toBytes(endDate));
                endFilter.setFilterIfMissing(true);
                fl.addFilter(startFilter);
                fl.addFilter(endFilter);
                scan.setFilter(fl);
            }
            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result result : scanner) {
                    events.add(mapResultToEvent(result));
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error querying HBase for search", e);
        }

        if (hasRegion) {
            String regionLower = region.trim().toLowerCase();
            events.removeIf(e -> e.getRegion() == null || !e.getRegion().toLowerCase().equals(regionLower));
        }
        if (hasType) {
            String typeLower = eventType.trim().toLowerCase();
            events.removeIf(e -> e.getEventType() == null || !e.getEventType().toLowerCase().equals(typeLower));
        }
        return events;
    }

    public List<AcledEvent> searchEvents(String country, String startDate, String endDate) {
        return searchEvents(null, country, null, startDate, endDate);
    }

    // ==================== OPTIMISED STATS METHODS ====================

    /** Uses AggregationClient for row count + projected scan for fatalities. */
    public CountryStats getCountryStats(String countryName) {
        try {
            Scan scan = new Scan();
            scan.setFilter(new PrefixFilter(Bytes.toBytes(countryName + "#")));
            long eventCount = aggregationClient.rowCount(
                    TableName.valueOf(TABLE_NAME), new LongColumnInterpreter(), scan);
            long totalFatalities = sumFatalities(countryName, null, null);
            return new CountryStats(countryName, (int) eventCount, (int) totalFatalities);
        } catch (Throwable e) {
            throw new RuntimeException("Error aggregating stats for country: " + countryName, e);
        }
    }

    public List<YearStats> getStatsByYear(String country, String startDate, String endDate) {
        Map<Integer, int[]> byYear = new LinkedHashMap<>();
        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME));
                ResultScanner scanner = table.getScanner(
                        buildFilteredScan(country, startDate, endDate, "week", "events", "fatalities"))) {
            for (Result r : scanner) {
                String week = Bytes.toString(r.getValue(CF, Bytes.toBytes("week")));
                if (week == null)
                    continue;
                int year;
                try {
                    year = LocalDate.parse(week).getYear();
                } catch (Exception e) {
                    continue;
                }
                int events = parseIntSafe(r, "events");
                int fatalities = parseIntSafe(r, "fatalities");
                byYear.computeIfAbsent(year, k -> new int[2]);
                byYear.get(year)[0] += events;
                byYear.get(year)[1] += fatalities;
            }
        } catch (IOException e) {
            throw new RuntimeException("Error scanning stats by year", e);
        }
        return byYear.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new YearStats(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .collect(Collectors.toList());
    }

    public List<EventTypeStats> getStatsByEventType(String country, String startDate, String endDate) {
        Map<String, int[]> totals = new LinkedHashMap<>();
        Map<String, Map<String, Integer>> subBreakdown = new LinkedHashMap<>();
        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME));
                ResultScanner scanner = table.getScanner(
                        buildFilteredScan(country, startDate, endDate,
                                "event_type", "sub_event_type", "events", "fatalities"))) {
            for (Result r : scanner) {
                String et = Bytes.toString(r.getValue(CF, Bytes.toBytes("event_type")));
                if (et == null)
                    et = "Unknown";
                String set = Bytes.toString(r.getValue(CF, Bytes.toBytes("sub_event_type")));
                if (set == null)
                    set = "Unknown";
                int events = parseIntSafe(r, "events");
                int fatalities = parseIntSafe(r, "fatalities");

                totals.computeIfAbsent(et, k -> new int[2]);
                totals.get(et)[0] += events;
                totals.get(et)[1] += fatalities;

                subBreakdown.computeIfAbsent(et, k -> new LinkedHashMap<>());
                subBreakdown.get(et).merge(set, events, Integer::sum);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error scanning stats by event type", e);
        }
        return totals.entrySet().stream()
                .sorted((a, b) -> b.getValue()[0] - a.getValue()[0])
                .map(e -> new EventTypeStats(e.getKey(), e.getValue()[0], e.getValue()[1],
                        subBreakdown.get(e.getKey())))
                .collect(Collectors.toList());
    }

    public List<RegionCountryStats> getStatsByRegion(String region) {
        Map<String, double[]> byCountry = new LinkedHashMap<>();
        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME))) {
            Scan scan = new Scan();
            // REQUIRED: add the region column so the filter can evaluate it
            scan.addColumn(CF, Bytes.toBytes("region"));
            scan.addColumn(CF, Bytes.toBytes("country"));
            scan.addColumn(CF, Bytes.toBytes("events"));
            scan.addColumn(CF, Bytes.toBytes("fatalities"));
            scan.addColumn(CF, Bytes.toBytes("population_exposure"));

            SingleColumnValueFilter filter = new SingleColumnValueFilter(
                    CF, Bytes.toBytes("region"),
                    CompareOperator.EQUAL, Bytes.toBytes(region));
            filter.setFilterIfMissing(true);
            scan.setFilter(filter);

            try (ResultScanner scanner = table.getScanner(scan)) {
                for (Result r : scanner) {
                    String c = Bytes.toString(r.getValue(CF, Bytes.toBytes("country")));
                    if (c == null)
                        c = "Unknown";
                    double events = parseIntSafe(r, "events");
                    double fatalities = parseIntSafe(r, "fatalities");
                    double popExposure = parseDoubleSafe(r, "population_exposure");
                    byCountry.computeIfAbsent(c, k -> new double[3]);
                    byCountry.get(c)[0] += events;
                    byCountry.get(c)[1] += fatalities;
                    byCountry.get(c)[2] += popExposure;
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error scanning region stats: " + region, e);
        }
        return byCountry.entrySet().stream()
                .map(e -> new RegionCountryStats(e.getKey(), (int) e.getValue()[0],
                        (int) e.getValue()[1], e.getValue()[2]))
                .sorted(Comparator.comparingInt(RegionCountryStats::getTotalEvents).reversed())
                .collect(Collectors.toList());
    }

    public List<AdminRiskStats> getRiskByAdmin1(String country, String startDate, String endDate) {
        Map<String, double[]> byAdmin = new LinkedHashMap<>();
        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME));
                ResultScanner scanner = table.getScanner(
                        buildFilteredScan(country, startDate, endDate,
                                "admin1", "events", "fatalities", "population_exposure"))) {
            for (Result r : scanner) {
                String admin = Bytes.toString(r.getValue(CF, Bytes.toBytes("admin1")));
                if (admin == null)
                    admin = "Unknown";
                double events = parseIntSafe(r, "events");
                double fatalities = parseIntSafe(r, "fatalities");
                double popExposure = parseDoubleSafe(r, "population_exposure");
                byAdmin.computeIfAbsent(admin, k -> new double[3]);
                byAdmin.get(admin)[0] += events;
                byAdmin.get(admin)[1] += fatalities;
                byAdmin.get(admin)[2] += popExposure;
            }
        } catch (IOException e) {
            throw new RuntimeException("Error scanning admin risk", e);
        }
        return byAdmin.entrySet().stream()
                .map(e -> {
                    double[] v = e.getValue();
                    double riskScore = v[1] * v[2];
                    return new AdminRiskStats(e.getKey(), (int) v[0], (int) v[1], v[2], riskScore);
                })
                .sorted(Comparator.comparingDouble(AdminRiskStats::getRiskScore).reversed())
                .collect(Collectors.toList());
    }

    // ==================== PRIVATE HELPERS ====================

    private Scan buildFilteredScan(String country, String startDate, String endDate,
            String... columnNames) throws IOException {
        Scan scan = new Scan();
        scan.setFilter(new PrefixFilter(Bytes.toBytes(country + "#")));
        if (startDate != null && endDate != null) {
            FilterList fl = new FilterList(FilterList.Operator.MUST_PASS_ALL);
            fl.addFilter(new SingleColumnValueFilter(CF, Bytes.toBytes("week"),
                    CompareOperator.GREATER_OR_EQUAL, Bytes.toBytes(startDate)));
            fl.addFilter(new SingleColumnValueFilter(CF, Bytes.toBytes("week"),
                    CompareOperator.LESS_OR_EQUAL, Bytes.toBytes(endDate)));
            scan.setFilter(fl);
        }
        for (String col : columnNames) {
            scan.addColumn(CF, Bytes.toBytes(col));
        }
        return scan;
    }

    private long sumFatalities(String country, String startDate, String endDate) {
        long sum = 0L;
        try (Table table = hbaseConnection.getTable(TableName.valueOf(TABLE_NAME));
                ResultScanner scanner = table.getScanner(
                        buildFilteredScan(country, startDate, endDate, "fatalities"))) {
            for (Result r : scanner) {
                sum += parseIntSafe(r, "fatalities");
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return sum;
    }

    private int parseIntSafe(Result r, String qualifier) {
        byte[] val = r.getValue(CF, Bytes.toBytes(qualifier));
        if (val == null)
            return 0;
        try {
            return Integer.parseInt(Bytes.toString(val));
        } catch (NumberFormatException e) {
            try {
                return (int) Double.parseDouble(Bytes.toString(val));
            } catch (NumberFormatException ex) {
                return 0;
            }
        }
    }

    private double parseDoubleSafe(Result r, String qualifier) {
        byte[] val = r.getValue(CF, Bytes.toBytes(qualifier));
        if (val == null)
            return 0.0;
        try {
            return Double.parseDouble(Bytes.toString(val));
        } catch (NumberFormatException e) {
            return 0.0;
        }
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
        event.setFatalities(fatalitiesStr != null ? parseIntSafe(result, "fatalities") : 0);

        String latStr = getValueAsStr(result, "latitude");
        event.setLatitude(latStr != null ? parseDoubleSafe(result, "latitude") : null);
        String lonStr = getValueAsStr(result, "longitude");
        event.setLongitude(lonStr != null ? parseDoubleSafe(result, "longitude") : null);

        String eventsStr = getValueAsStr(result, "events");
        event.setEvents(eventsStr != null ? parseIntSafe(result, "events") : null);

        String popStr = getValueAsStr(result, "population_exposure");
        event.setPopExposure(
                (popStr != null && !popStr.isEmpty()) ? parseDoubleSafe(result, "population_exposure") : null);

        return event;
    }

    private String getValueAsStr(Result result, String qualifier) {
        byte[] value = result.getValue(CF, Bytes.toBytes(qualifier));
        return value != null ? Bytes.toString(value) : null;
    }

    private String titleCase(String value) {
        if (value == null || value.isBlank())
            return value;
        return Arrays.stream(value.trim().split("\\s+"))
                .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}