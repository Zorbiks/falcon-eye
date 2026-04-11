package com.falconeye.backend.services;

import com.falconeye.backend.models.MilitaryAsset;
import com.falconeye.backend.repositories.MilitaryAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MilitaryAssetService {

    @Autowired
    private MilitaryAssetRepository repository;

    public List<MilitaryAsset> getAllAssets() {
        return repository.findAll();
    }

    public Optional<MilitaryAsset> getAssetById(Long id) {
        return repository.findById(id);
    }

    public MilitaryAsset createAsset(MilitaryAsset asset) {
        asset.setLastDeployed(LocalDateTime.now());
        return repository.save(asset);
    }

    public MilitaryAsset updateAsset(Long id, MilitaryAsset assetDetails) {
        return repository.findById(id).map(asset -> {
            asset.setName(assetDetails.getName());
            asset.setType(assetDetails.getType());
            asset.setLatitude(assetDetails.getLatitude());
            asset.setLongitude(assetDetails.getLongitude());
            asset.setStatus(assetDetails.getStatus());
            return repository.save(asset);
        }).orElseThrow(() -> new RuntimeException("Asset not found"));
    }

    public void deleteAsset(Long id) {
        repository.deleteById(id);
    }
}