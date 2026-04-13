package com.falconeye.backend.controllers;

import com.falconeye.backend.models.MilitaryAsset;
import com.falconeye.backend.services.MilitaryAssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*") // Allows your future React frontend to connect
public class MilitaryAssetController {

    @Autowired
    private MilitaryAssetService service;

    // Both ADMIN and USER can view assets
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public List<MilitaryAsset> getAllAssets() {
        return service.getAllAssets();
    }

    // Only ADMIN (Commander) can create assets
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public MilitaryAsset createAsset(@RequestBody MilitaryAsset asset) {
        return service.createAsset(asset);
    }

    // Only ADMIN (Commander) can update assets
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MilitaryAsset> updateAsset(@PathVariable Long id, @RequestBody MilitaryAsset asset) {
        return ResponseEntity.ok(service.updateAsset(id, asset));
    }

    // Only ADMIN (Commander) can delete assets
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        service.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}