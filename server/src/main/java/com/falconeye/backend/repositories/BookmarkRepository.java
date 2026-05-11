package com.falconeye.backend.repositories;

import com.falconeye.backend.models.EventsBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<EventsBookmark, Long> {

    // Fetch all bookmarks belonging to a user
    List<EventsBookmark> findByUserId(Long userId);

    // Check if a specific bookmark already exists (for toggle logic)
    Optional<EventsBookmark> findByUserIdAndRowKey(Long userId, String rowKey);

    // For the unbookmark delete operation
    void deleteByUserIdAndRowKey(Long userId, String rowKey);

    // Check existence without loading the entity
    boolean existsByUserIdAndRowKey(Long userId, String rowKey);
}