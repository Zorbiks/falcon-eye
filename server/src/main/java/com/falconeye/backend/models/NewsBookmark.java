package com.falconeye.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "news_bookmarks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "link"})
)
public class NewsBookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Full news object — stored at bookmark time
    @Column(name = "link", nullable = false, length = 2048)
    private String link;

    @Column(name = "title", nullable = false, length = 1024)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "source")
    private String source;

    @Column(name = "published_at")
    private String publishedAt;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;
}
