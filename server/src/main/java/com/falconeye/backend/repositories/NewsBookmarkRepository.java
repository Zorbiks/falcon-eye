package com.falconeye.backend.repositories;

import com.falconeye.backend.models.NewsBookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsBookmarkRepository extends JpaRepository<NewsBookmark, Long> {

    List<NewsBookmark> findByUserId(Long userId);

    Optional<NewsBookmark> findByUserIdAndLink(Long userId, String link);

    void deleteByUserIdAndLink(Long userId, String link);

    boolean existsByUserIdAndLink(Long userId, String link);
}
