package com.falconeye.backend.repositories;

import com.falconeye.backend.models.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    // Fetch all bookmarks belonging to a user
    List<Bookmark> findByUserId(Long userId);

    // Check if a specific bookmark already exists (for toggle logic)
    Optional<Bookmark> findByUserIdAndRowKey(Long userId, String rowKey);

    // For the unbookmark delete operation
    void deleteByUserIdAndRowKey(Long userId, String rowKey);

    // Check existence without loading the entity
    boolean existsByUserIdAndRowKey(Long userId, String rowKey);
}