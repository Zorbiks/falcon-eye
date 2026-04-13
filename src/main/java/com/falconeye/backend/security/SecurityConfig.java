package com.falconeye.backend.security;

import com.falconeye.backend.models.Role;
import com.falconeye.backend.models.User;
import com.falconeye.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables the @PreAuthorize annotations in the Controller
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disabled for easy Postman testing
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() 
                
                // --- NEW JALON 3 RULE: HBase Big Data Access ---
                .requestMatchers(HttpMethod.GET, "/api/events/**").hasAnyRole("ADMIN", "USER")
                
                // --- JALON 2 RULES: MySQL CRUD Access ---
                .requestMatchers(HttpMethod.GET, "/api/assets/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/assets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/assets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/assets/**").hasRole("ADMIN")
                
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults()); // Uses Basic Auth for the REST API

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // This automatically creates users in MySQL so you can test immediately!
    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User(null, "commander", passwordEncoder.encode("admin123"), Role.ADMIN);
                User user = new User(null, "analyst", passwordEncoder.encode("user123"), Role.USER);
                userRepository.save(admin);
                userRepository.save(user);
                System.out.println("✅ Default users created: 'commander' (ADMIN) and 'analyst' (USER)");
            }
        };
    }
}