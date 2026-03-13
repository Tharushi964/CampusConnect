package com.campusconnect.controller.component1;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import com.campusconnect.config.Security.JWTService;
import com.campusconnect.dto.component1.AuthRequest;
import com.campusconnect.dto.component1.AuthResponse;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.entity.component1.User;

@CrossOrigin(origins = {"http://localhost:5174", "http://localhost:5174"})
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

     private final JWTService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                        UserRepository userRepository,
                        JWTService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        System.out.println("LOGIN API CALLED");
        System.out.println("USERNAME: " + request.getUsername());
        System.out.println("PASSWORD: " + request.getPassword());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().getRoleName());
        return new AuthResponse(
                token,
                user.getUserId(),
                user.getRole().getRoleName()
        );
        
    }
}
