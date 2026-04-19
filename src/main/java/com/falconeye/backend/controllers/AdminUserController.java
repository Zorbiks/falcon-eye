package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.AdminUserRequest;
import com.falconeye.backend.models.User;
import com.falconeye.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')") // Critical: Applies to ALL methods in this class
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private UserService userService;

    // View all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 1. Admin creates a user and assigns an explicit Role
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody AdminUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole()); 
        user.setActive(true); // Default to active
        
        return ResponseEntity.ok(userService.createUser(user));
    }

    // 2. Admin deactivates a user
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<User> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserActiveStatus(id, false));
    }

    // (Optional but recommended) Admin activates a previously deactivated user
    @PatchMapping("/{id}/activate")
    public ResponseEntity<User> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserActiveStatus(id, true));
    }

    // 3. Admin strictly deletes a user from the database
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}