package com.falconeye.backend.config;

import com.falconeye.backend.models.Role;
import com.falconeye.backend.models.User;
import com.falconeye.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if the "admin" user already exists to prevent duplicate creation on restarts
        if (userRepository.findByUsername("admin").isEmpty()) {
            
            User defaultAdmin = new User();
            defaultAdmin.setUsername("admin");
            // Set an easy, temporary password for initial setup
            defaultAdmin.setPassword(passwordEncoder.encode("admin123")); 
            defaultAdmin.setRole(Role.ADMIN);
            defaultAdmin.setActive(true); // Ensure they can log in immediately

            userRepository.save(defaultAdmin);
            
            System.out.println("=================================================");
            System.out.println("DEFAULT ADMIN CREATED: username: admin | password: admin123");
            System.out.println("PLEASE CREATE A SECURE ADMIN AND DELETE THIS ONE ASAP.");
            System.out.println("=================================================");
        }
    }
}