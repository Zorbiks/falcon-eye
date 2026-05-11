package com.falconeye.backend.services;

import com.falconeye.backend.dto.NewsBookmarkResponse;
import com.falconeye.backend.models.NewsBookmark;
import com.falconeye.backend.models.User;
import com.falconeye.backend.repositories.NewsBookmarkRepository;
import com.falconeye.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NewsBookmarkService {

    @Autowired
    private NewsBookmarkRepository newsBookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<NewsBookmarkResponse> addBookmark(String username, NewsBookmark newsItem) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();

        return Optional.of(
            newsBookmarkRepository.findByUserIdAndLink(user.getId(), newsItem.getLink())
                .map(NewsBookmarkResponse::from)
                .orElseGet(() -> {
                    NewsBookmark bookmark = new NewsBookmark();
                    bookmark.setUser(user);
                    bookmark.setLink(newsItem.getLink());
                    bookmark.setTitle(newsItem.getTitle());
                    bookmark.setDescription(newsItem.getDescription());
                    bookmark.setSource(newsItem.getSource());
                    bookmark.setPublishedAt(newsItem.getPublishedAt());
                    bookmark.setImageUrl(newsItem.getImageUrl());
                    return NewsBookmarkResponse.from(newsBookmarkRepository.save(bookmark));
                })
        );
    }

    @Transactional
    public boolean removeBookmark(String username, String link) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        if (!newsBookmarkRepository.existsByUserIdAndLink(user.getId(), link)) return false;

        newsBookmarkRepository.deleteByUserIdAndLink(user.getId(), link);
        return true;
    }

    public Optional<List<NewsBookmarkResponse>> getMyBookmarks(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        return Optional.of(
            newsBookmarkRepository.findByUserId(userOpt.get().getId())
                .stream()
                .map(NewsBookmarkResponse::from)
                .collect(Collectors.toList())
        );
    }

    public Optional<Boolean> isBookmarked(String username, String link) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        return Optional.of(
            newsBookmarkRepository.existsByUserIdAndLink(userOpt.get().getId(), link)
        );
    }
}
