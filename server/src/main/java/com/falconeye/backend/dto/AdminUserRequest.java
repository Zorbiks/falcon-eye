package com.falconeye.backend.dto;

import com.falconeye.backend.models.Role;
import lombok.Data;

@Data
public class AdminUserRequest {
    private String username;
    private String password;
    private Role role;
}