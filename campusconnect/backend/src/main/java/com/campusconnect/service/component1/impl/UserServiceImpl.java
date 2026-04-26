package com.campusconnect.service.component1.impl;

import com.campusconnect.dto.component1.UserDtos;
import com.campusconnect.entity.component1.BatchRepRequest;
import com.campusconnect.entity.component1.Role;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component2.Batch;
import com.campusconnect.entity.component2.Campus;
import com.campusconnect.entity.component2.Faculty;
import com.campusconnect.entity.component2.Program;
import com.campusconnect.entity.component2.Semester;
import com.campusconnect.repository.component1.BatchRepRequestRepository;
import com.campusconnect.repository.component1.RoleRepository;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component2.BatchRepository;
import com.campusconnect.repository.component2.CampusRepository;
import com.campusconnect.repository.component2.FacultyRepository;
import com.campusconnect.repository.component2.ProgramRepository;
import com.campusconnect.repository.component2.SemesterRepository;
import com.campusconnect.service.component1.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
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
    private final ProgramRepository programRepository;
    private final FacultyRepository facultyRepository;
    private final SemesterRepository semesterRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDtos.Response create(UserDtos.Request request) {

            if (request.roleId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
            }

            if (!StringUtils.hasText(request.username())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
            }

            if (!StringUtils.hasText(request.password())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
            }

            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
            String roleName = role.getRoleName().toUpperCase();
            
                    if (!roleName.equals("ADMIN")) {

                        if (request.batchId() == null) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Batch is required");
                        }

                        if (request.programId() == null) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Program is required");
                        }

                        if (request.facultyId() == null) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faculty is required");
                        }

                        if (request.semesterId() == null) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Semester is required");
                        }
                    }

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

            if (StringUtils.hasText(request.studentId()) && userRepository.existsByStudentId(request.studentId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID already exists");
            }

                Program program = null;
                if (request.programId() != null) {
                program = programRepository.findById(request.programId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found"));
                }

                Faculty faculty = null;
                if (request.facultyId() != null) {
                faculty = facultyRepository.findById(request.facultyId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found"));
                }

                Semester semester = null;
                if (request.semesterId() != null) {
                semester = semesterRepository.findById(request.semesterId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found"));
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
            user.setFaculty(faculty);
            user.setProgram(program);
            user.setSemester(semester);

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
    @Transactional
    public void delete(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId);
        }

        // Clean up batch rep requests first to avoid FK violations on users deletion.
        batchRepRequestRepository.deleteByUser_UserId(userId);

        try {
            userRepository.deleteById(userId);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Cannot delete this user because related records exist. Remove dependent records first or deactivate the user."
            );
        }
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
            user.getCampus() == null ? null : user.getCampus().getCampusId(),
            user.getProgram() == null ? null : user.getProgram().getProgramId(),
            user.getFaculty() == null ? null : user.getFaculty().getFacultyId(),
            user.getSemester() == null ? null : user.getSemester().getSemesterId()
        );

    }
}

