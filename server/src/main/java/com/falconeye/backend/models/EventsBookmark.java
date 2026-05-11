package com.falconeye.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "events_bookmarks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "row_key"})
)
public class EventsBookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who created this bookmark
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Full event data — stored at bookmark time, no HBase lookup needed
    @Column(name = "row_key", nullable = false)
    private String rowKey;

    @Column(name = "week")
    private String week;

    @Column(name = "region")
    private String region;

    @Column(name = "country")
    private String country;

    @Column(name = "admin1")
    private String admin1;

    @Column(name = "event_type")
    private String eventType;

    @Column(name = "sub_event_type")
    private String subEventType;

    @Column(name = "fatalities")
    private Integer fatalities;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "disorder_type")
    private String disorderType;

    @Column(name = "events")
    private Integer events;

    @Column(name = "pop_exposure")
    private Double popExposure;

    @Column(name = "critical")
    private Boolean critical;
}