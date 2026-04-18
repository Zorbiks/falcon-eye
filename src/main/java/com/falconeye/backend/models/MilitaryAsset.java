package com.falconeye.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "military_assets")
public class MilitaryAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private AssetType type;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private AssetStatus status;
    
    private LocalDateTime lastDeployed;

    
    public void updateLocation(Double lat, Double lon) {
        this.latitude = lat;
        this.longitude = lon;
    }
}