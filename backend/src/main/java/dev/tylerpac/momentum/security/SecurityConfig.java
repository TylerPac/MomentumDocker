package dev.tylerpac.momentum.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// Declares this class as a Spring configuration source.
@Configuration
// Turns on Spring Security's web integration.
@EnableWebSecurity
public class SecurityConfig {

        // Custom filter that reads JWT bearer tokens from incoming requests.
        private final JwtAuthFilter jwtAuthFilter;

        // Constructor injection lets Spring provide the JwtAuthFilter bean.
        public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
                this.jwtAuthFilter = jwtAuthFilter;
        }

        // Exposes AuthenticationManager so controllers can perform login authentication.
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
                // Uses Spring's auto-configured authentication pipeline (UserDetailsService + PasswordEncoder).
                return configuration.getAuthenticationManager();
        }

        // Password hashing strategy used when checking login passwords and storing new passwords.
        @Bean
        public PasswordEncoder passwordEncoder() {
                // BCrypt is intentionally slow and salted; good default for password hashing.
                return new BCryptPasswordEncoder();
        }

        // Main HTTP security configuration for all routes.
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                return http
                        // JWT bearer auth: no server sessions.
                        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                        // SPA + REST API: enable CORS so Vite dev server can call the backend.
                        .cors(Customizer.withDefaults())

                        // Bearer tokens: no cookies => CSRF protection isn't required.
                        .csrf(csrf -> csrf.disable())

                        // Disable any session/cookie based auth mechanisms.
                        .formLogin(form -> form.disable())
                        .httpBasic(basic -> basic.disable())
                        .logout(logout -> logout.disable())

                        .authorizeHttpRequests(auth -> auth
                        // Allow browser CORS preflight requests.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Login is public so users can obtain a JWT.
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        // Registration is public so new users can create an account.
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        // Every other endpoint requires a valid authenticated principal.
                        .anyRequest().authenticated())

                        // Run JWT parsing before Spring's default username/password auth filter.
                        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                        .build();
        }

        // Central CORS policy used by .cors(Customizer.withDefaults()) above.
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                // Build a CORS config object that controls browser cross-origin requests.
                CorsConfiguration cors = new CorsConfiguration();
                // Frontend origins allowed to call this backend.
                cors.setAllowedOrigins(List.of(
                        "https://momentum.tylerpac.dev",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000"
                ));
                // HTTP methods the browser may use cross-origin.
                cors.setAllowedMethods(List.of(
                        HttpMethod.GET.name(),
                        HttpMethod.POST.name(),
                        HttpMethod.PUT.name(),
                        HttpMethod.DELETE.name(),
                        HttpMethod.OPTIONS.name()
                ));
                // Request headers allowed from frontend calls.
                cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
                // false because auth is bearer-token header based, not cookie based.
                cors.setAllowCredentials(false);

                // Register this CORS config for all backend routes.
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", cors);
                return source;
        }
}
