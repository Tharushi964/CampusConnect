package com.campusconnect.service.component2.impl;

import com.campusconnect.dto.component2.FacultyDtos;
import com.campusconnect.entity.component2.Faculty;
import com.campusconnect.repository.component2.FacultyRepository;
import com.campusconnect.service.component2.FacultyService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;

    @Override
    public FacultyDtos.Response create(FacultyDtos.Request request) {
        Faculty faculty = new Faculty();
        faculty.setFacultyName(request.facultyName());
        faculty.setStatus(request.status());

        return toResponse(facultyRepository.save(faculty));
    }

    @Override
    public FacultyDtos.Response update(Long id, FacultyDtos.Request request) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Faculty not found: " + id));

        faculty.setFacultyName(request.facultyName());
        faculty.setStatus(request.status());

        return toResponse(facultyRepository.save(faculty));
    }

    @Override
    public FacultyDtos.Response getById(Long id) {
        return facultyRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Faculty not found: " + id));
    }

    @Override
    public List<FacultyDtos.Response> getAll() {
        return facultyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!facultyRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Faculty not found: " + id);
        }
        facultyRepository.deleteById(id);
    }

    private FacultyDtos.Response toResponse(Faculty faculty) {
        return new FacultyDtos.Response(
                faculty.getFacultyId(),
                faculty.getFacultyName(),
                faculty.getStatus()
        );
    }
}