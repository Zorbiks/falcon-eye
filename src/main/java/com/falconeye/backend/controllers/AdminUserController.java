package com.falconeye.backend.controllers;

import com.falconeye.backend.dto.AdminUserRequest;
import com.falconeye.backend.dto.MessageResponse;
import com.falconeye.backend.dto.UserResponse;
import com.falconeye.backend.models.User;
import com.falconeye.backend.repositories.UserRepository;
import com.falconeye.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    // View all users
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // Admin creates a user and assigns an explicit Role
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody AdminUserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(409).body(new MessageResponse("Error: Username '" + request.getUsername() + "' is already taken."));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setActive(true); // Default to active

        User created = userService.createUser(user);
        return ResponseEntity.ok(new UserResponse(created));
    }

    // Admin deactivates a user
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        User user = userService.toggleUserActiveStatus(id, false);
        if (user == null) {
            return ResponseEntity.status(404).body(new MessageResponse("Cannot deactivate: no user found with ID " + id));
        }
        return ResponseEntity.ok(new UserResponse(user));
    }

    // Admin activates a previously deactivated user
    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        User user = userService.toggleUserActiveStatus(id, true);
        if (user == null) {
            return ResponseEntity.status(404).body(new MessageResponse("Cannot activate: no user found with ID " + id));
        }
        return ResponseEntity.ok(new UserResponse(user));
    }

    // Admin strictly deletes a user from the database
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        if (!userService.deleteUser(id)) {
            return ResponseEntity.status(404).body(new MessageResponse("User not found with ID: " + id));
        }
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}