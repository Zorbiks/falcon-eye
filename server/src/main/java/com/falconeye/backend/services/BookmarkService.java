package com.falconeye.backend.services;

import com.falconeye.backend.dto.BookmarkResponse;
import com.falconeye.backend.models.Bookmark;
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
public class BookmarkService {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HBaseService hbaseService;

    public Optional<BookmarkResponse> addBookmark(String username, String rowKey) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();

        return Optional.of(
            bookmarkRepository.findByUserIdAndRowKey(user.getId(), rowKey)
                .map(BookmarkResponse::from)
                .orElseGet(() -> {
                    Bookmark bookmark = new Bookmark();
                    bookmark.setUser(user);
                    bookmark.setRowKey(rowKey);
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

    public Optional<List<BookmarkResponse>> getMyBookmarks(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return Optional.empty();

        return Optional.of(
            bookmarkRepository.findByUserId(userOpt.get().getId())
                .stream()
                .map(bookmark -> {
                    BookmarkResponse response = BookmarkResponse.from(bookmark);
                    // Enrich with event data from HBase
                    hbaseService.getEventByRowKey(bookmark.getRowKey())
                            .ifPresent(response::setEvent);
                    return response;
                })
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