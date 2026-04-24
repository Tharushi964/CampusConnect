package com.campusconnect.config.Security;

import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
public SecurityFilterChain filterChain(HttpSecurity http, JWTAuthenticationFilter jwtFilter) throws Exception {

    http
        .cors(cors -> {})
        .csrf(csrf -> csrf.disable())        
        .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .requestMatchers("/api/users/**").permitAll()
                
                .requestMatchers("/api/roles/all").permitAll()
                .requestMatchers("/api/roles/**").hasRole("ADMIN")

                .requestMatchers("/api/batches/all").permitAll()
                .requestMatchers("/api/batches/getByCurriculum").permitAll()
                .requestMatchers("/api/batches/get").permitAll()
                .requestMatchers("/api/batches/**").hasAnyRole("ADMIN","BATCHREP")
                .requestMatchers("/api/batches/delete").hasRole("ADMIN")

                .requestMatchers("/api/campus/all").permitAll()
                .requestMatchers("/api/campus/getById").permitAll()

                .requestMatchers("/api/faculties/all").permitAll()
                .requestMatchers("/api/faculties/getByCampus").permitAll()
                .requestMatchers("/api/faculties/get").permitAll()

                .requestMatchers("/api/programs/all").permitAll()
                .requestMatchers("/api/programs/getByFaculty").permitAll()
                .requestMatchers("/api/programs/get").permitAll()

                .requestMatchers("/api/curriculums/all").permitAll()
                .requestMatchers("/api/curriculums/getByProgram").permitAll()

                .requestMatchers("/api/semesters/all").permitAll()
                .requestMatchers("/api/semesters/getByBatch").permitAll()
                .requestMatchers("/api/semesters/get").permitAll()
                
                .requestMatchers("/api/subjects/get").permitAll()
                .requestMatchers("/api/subjects/getBySemester").permitAll()

                .requestMatchers("/api/resources/getBySubject").permitAll()
                .requestMatchers("/api/resources/get").permitAll()
                .requestMatchers("/api/resources/create").permitAll()
                .requestMatchers("/api/resources/update").permitAll()

                .requestMatchers("/api/group-members/**").permitAll()

                .requestMatchers("/api/groups/**").permitAll()


                .anyRequest().authenticated()
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }
}