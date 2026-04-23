package com.falconeye.backend.dto;

import com.falconeye.backend.models.Role;
import com.falconeye.backend.models.User;

import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String username;
    private Role role;
    private boolean active;
    private LocalDateTime joiningDate;

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.role = user.getRole();
        this.active = user.isActive();
        this.joiningDate = user.getJoiningDate();
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public Role getRole() { return role; }
    public boolean isActive() { return active; }
    public LocalDateTime getJoiningDate() { return joiningDate; }
}
