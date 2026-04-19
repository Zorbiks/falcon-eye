package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.AdminUserRequest;
import com.falconeye.backend.dto.MessageResponse;
import com.falconeye.backend.dto.UserResponse;
import com.falconeye.backend.models.User;
import com.falconeye.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')") // Critical: Applies to ALL methods in this class
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private UserService userService;

    // View all users
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // 1. Admin creates a user and assigns an explicit Role
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody AdminUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setActive(true); // Default to active

        User created = userService.createUser(user);
        return ResponseEntity.ok(new UserResponse(created));
    }

    // 2. Admin deactivates a user
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        User user = userService.toggleUserActiveStatus(id, false);
        return ResponseEntity.ok(new UserResponse(user));
    }

    // (Optional but recommended) Admin activates a previously deactivated user
    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        User user = userService.toggleUserActiveStatus(id, true);
        return ResponseEntity.ok(new UserResponse(user));
    }

    // 3. Admin strictly deletes a user from the database
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}
