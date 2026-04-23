package com.falconeye.backend.security;

import com.falconeye.backend.services.CustomUserDetailsService;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            /*
             * BUG FIX: The original code let jwtUtil.extractUsername() throw uncaught
             * exceptions (expired token, malformed JWT, invalid signature) which propagated
             * as HTTP 500 errors instead of simply treating the request as unauthenticated.
             * Now any parsing error is caught and the filter continues the chain without
             * setting an authentication — Spring Security will then return 401 as expected.
             */
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Invalid / expired / malformed token — leave username null so the request
                // proceeds as unauthenticated. Spring Security will handle the 401.
                logger.warn("JWT parsing failed: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // User may have been deleted between token issuance and this request.
                // Treat as unauthenticated.
                logger.warn("Could not authenticate user '" + username + "': " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
