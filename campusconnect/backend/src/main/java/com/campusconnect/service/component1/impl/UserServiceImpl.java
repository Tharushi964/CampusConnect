package com.campusconnect.service.component1.impl;

import com.campusconnect.dto.component1.UserDtos;
import com.campusconnect.entity.component1.BatchRepRequest;
import com.campusconnect.entity.component1.Role;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component2.Batch;
import com.campusconnect.entity.component2.Campus;
import com.campusconnect.repository.component1.BatchRepRequestRepository;
import com.campusconnect.repository.component1.RoleRepository;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component2.BatchRepository;
import com.campusconnect.repository.component2.CampusRepository;
import com.campusconnect.service.component1.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BatchRepository batchRepository;
    private final CampusRepository campusRepository;
    private final BatchRepRequestRepository batchRepRequestRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDtos.Response create(UserDtos.Request request) {

            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));

            boolean isBatchRep = role.getRoleName().equalsIgnoreCase("BATCHREP");

            Batch batch = null;
            if (request.batchId() != null) {
                batch = batchRepository.findById(request.batchId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));
            }
            if (isBatchRep) {
                if (batch == null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "BatchRep must belong to a batch"
                    );
                }
                long count = userRepository
                        .countByBatch_BatchIdAndRole_RoleName(batch.getBatchId(), "BATCHREP");
                if (count >= 4) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "This batch already has maximum 4 Batch Representatives"
                    );
                }
            }

            Campus campus;
            if (request.campusId() != null) {
                campus = campusRepository.findById(request.campusId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campus not found"));
            } else {
                campus = campusRepository.findByCampusName("SLIIT Malabe");
                if (campus == null) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Default campus not found");
                }
            }

            if (userRepository.existsByUsername(request.username())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
            }

            if (userRepository.existsByEmail(request.email())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
            }

            User user = new User();
            user.setFirstName(request.firstName());
            user.setLastName(request.lastName());
            user.setStudentId(request.studentId());
            user.setEmail(request.email());
            user.setUsername(request.username());
            user.setPassword(passwordEncoder.encode(request.password()));
            user.setCreatedAt(LocalDateTime.now());
            user.setRole(role);
            user.setBatch(batch);
            user.setCampus(campus);

            if (isBatchRep) {
                user.setStatus("PENDING_APPROVAL");
            } else {
                user.setStatus("ACTIVE");
            }

            User savedUser = userRepository.save(user);

            // Create BatchRep request
            if (isBatchRep) {

                BatchRepRequest batchRepRequest = new BatchRepRequest();
                batchRepRequest.setUser(savedUser);
                batchRepRequest.setBatch(batch);
                batchRepRequest.setStatus("PENDING");
                batchRepRequest.setCreatedAt(LocalDateTime.now());

                batchRepRequestRepository.save(batchRepRequest);
            }

            return toResponse(savedUser);
        }


    @Override
    public UserDtos.Response update(Long userId, UserDtos.Request request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // ✅ Update only if provided
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }

        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }

        if (request.email() != null) {
            if (userRepository.existsByEmail(request.email()) &&
                !user.getEmail().equals(request.email())) {

                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
            }
            user.setEmail(request.email());
        }

        if (request.studentId() != null) {
           if (userRepository.existsByStudentId(request.studentId()) &&
                !user.getStudentId().equals(request.studentId())) {

                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "StudentId already exists");
            }
            user.setStudentId(request.studentId());
        }

        if (request.password() != null) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        if (request.status() != null) {
            user.setStatus(request.status());
        }

        // ✅ Handle role safely
        if (request.roleId() != null) {
            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
            user.setRole(role);
        }

        // ✅ Handle batch safely
        if (request.batchId() != null) {
            Batch batch = batchRepository.findById(request.batchId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));
            user.setBatch(batch);
        }

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserDtos.Response getById(Long userId) {
        return userRepository.findById(userId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));
    }

    @Override
    public List<UserDtos.Response> getAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId);
        }
        userRepository.deleteById(userId);
    }

    private UserDtos.Response toResponse(User user) {
        Long roleId = user.getRole() == null || user.getRole().getRoleId() == null ? null : user.getRole().getRoleId().longValue();
        return new UserDtos.Response(
            user.getUserId(),
            user.getFirstName(),
            user.getLastName(),
            user.getStudentId(),
            user.getEmail(),
            user.getUsername(),
            user.getStatus(),
            user.getCreatedAt(),
            roleId,
            user.getBatch() == null ? null : user.getBatch().getBatchId(),
            user.getCampus() == null ? null : user.getCampus().getCampusId()
        );

    }
}

