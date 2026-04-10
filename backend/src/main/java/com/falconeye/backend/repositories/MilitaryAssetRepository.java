package com.falconeye.backend.repositories;

import com.falconeye.backend.models.MilitaryAsset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilitaryAssetRepository extends JpaRepository<MilitaryAsset, Long> {
}