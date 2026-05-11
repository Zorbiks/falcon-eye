package com.falconeye.backend.services;

import com.falconeye.backend.dto.BookmarkResponse;
import com.falconeye.backend.models.AcledEvent;
import com.falconeye.backend.models.EventsBookmark;
import com.falconeye.backend.models.User;
import com.falconeye.backend.repositories.BookmarkRepository;
import com.falconeye.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventsBookmarkService {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Bookmarks an event, storing all event fields in the bookmarks table.
     * If already bookmarked, returns the existing bookmark unchanged.
     */
    public Optional<BookmarkResponse> addBookmark(String username, AcledEvent event) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();

        return Optional.of(
            bookmarkRepository.findByUserIdAndRowKey(user.getId(), event.getRowKey())
                .map(BookmarkResponse::from)
                .orElseGet(() -> {
                    EventsBookmark bookmark = new EventsBookmark();
                    bookmark.setUser(user);
                    bookmark.setRowKey(event.getRowKey());
                    bookmark.setWeek(event.getWeek());
                    bookmark.setRegion(event.getRegion());
                    bookmark.setCountry(event.getCountry());
                    bookmark.setAdmin1(event.getAdmin1());
                    bookmark.setEventType(event.getEventType());
                    bookmark.setSubEventType(event.getSubEventType());
                    bookmark.setFatalities(event.getFatalities());
                    bookmark.setLatitude(event.getLatitude());
                    bookmark.setLongitude(event.getLongitude());
                    bookmark.setDisorderType(event.getDisorderType());
                    bookmark.setEvents(event.getEvents());
                    bookmark.setPopExposure(event.getPopExposure());
                    bookmark.setCritical(event.isCritical());
                    return BookmarkResponse.from(bookmarkRepository.save(bookmark));
                })
        );
    }

    @Transactional
    public boolean removeBookmark(String username, String rowKey) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        if (!bookmarkRepository.existsByUserIdAndRowKey(user.getId(), rowKey)) return false;

        bookmarkRepository.deleteByUserIdAndRowKey(user.getId(), rowKey);
        return true;
    }

    /**
     * Returns all bookmarks for the user. All event data is already in the DB — no HBase call needed.
     */
    public Optional<List<BookmarkResponse>> getMyBookmarks(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        return Optional.of(
            bookmarkRepository.findByUserId(userOpt.get().getId())
                .stream()
                .map(BookmarkResponse::from)
                .collect(Collectors.toList())
        );
    }

    public Optional<Boolean> isBookmarked(String username, String rowKey) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        return Optional.of(
            bookmarkRepository.existsByUserIdAndRowKey(userOpt.get().getId(), rowKey)
        );
    }
}