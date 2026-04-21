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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

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

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();

        System.out.println("DB PASSWORD = " + user.getPassword());

        System.out.println("MATCH RESULT = " +
                passwordEncoder.matches(request.getPassword(), user.getPassword()));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().getRoleName());

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().getRoleName(),
                user.getStatus(),
                user.getCampus() == null ? null : user.getCampus().getCampusId(),
                user.getFaculty() == null ? null : user.getFaculty().getFacultyId(),
                user.getProgram() == null ? null : user.getProgram().getProgramId(),
                user.getBatch() == null ? null : user.getBatch().getBatchId(),
                user.getSemester() == null ? null : user.getSemester().getSemesterId()
        );
        }

}
