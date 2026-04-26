package com.campusconnect.service.component2.impl;

import com.campusconnect.dto.component2.SemesterDtos;
import com.campusconnect.entity.component2.Batch;
import com.campusconnect.entity.component2.Program;
import com.campusconnect.entity.component2.Semester;
import com.campusconnect.repository.component2.BatchRepository;
import com.campusconnect.repository.component2.SemesterRepository;
import com.campusconnect.service.component2.SemesterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService {
    private final SemesterRepository semesterRepository;
    private final BatchRepository batchRepository;

    @Override
    public SemesterDtos.Response create(SemesterDtos.Request request) {
        validateSemesterDates(request.startDate(), request.endDate());

        boolean duplicateExists = semesterRepository.existsByBatch_BatchIdAndYearNumberAndSemesterNumber(
            request.batchId(),
            request.yearNumber(),
            request.semesterNumber()
        );

        if (duplicateExists) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Semester already exists for this batch, year and semester number"
            );
        }

        Batch batch = batchRepository.findById(request.batchId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found: " + request.batchId()));

        Semester semester = new Semester();
        semester.setYearNumber(request.yearNumber());
        semester.setSemesterNumber(request.semesterNumber());
        semester.setStartDate(request.startDate());
        semester.setEndDate(request.endDate());
        semester.setStatus(request.status());
        semester.setBatch(batch);
        return toResponse(semesterRepository.save(semester));
    }

    @Override
    public SemesterDtos.Response update(Long semesterId, SemesterDtos.Request request) {
        validateSemesterDates(request.startDate(), request.endDate());

        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + semesterId));

        boolean duplicateExists = semesterRepository.existsByBatch_BatchIdAndYearNumberAndSemesterNumberAndSemesterIdNot(
            request.batchId(),
            request.yearNumber(),
            request.semesterNumber(),
            semesterId
        );

        if (duplicateExists) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Another semester already exists for this batch, year and semester number"
            );
        }

        Batch batch = batchRepository.findById(request.batchId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found: " + request.batchId()));

        semester.setYearNumber(request.yearNumber());
        semester.setSemesterNumber(request.semesterNumber());
        semester.setStartDate(request.startDate());
        semester.setEndDate(request.endDate());
        semester.setStatus(request.status());
        semester.setBatch(batch);
        return toResponse(semesterRepository.save(semester));
    }

    @Override
    public SemesterDtos.Response getById(Long semesterId) {
        return semesterRepository.findById(semesterId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + semesterId));
    }

    @Override
    public List<SemesterDtos.Response> getAll() {
        return semesterRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long semesterId) {
        if (!semesterRepository.existsById(semesterId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + semesterId);
        }
        semesterRepository.deleteById(semesterId);
    }

    @Override
    public void generateSemestersForBatch(Batch batch) {
        if (batch == null || batch.getBatchId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Batch is required for semester generation");
        }

        if (semesterRepository.existsByBatch_BatchId(batch.getBatchId())) {
            return;
        }

        if (batch.getCurriculum() == null || batch.getCurriculum().getProgram() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Batch curriculum with program is required for semester generation");
        }

        Program program = batch.getCurriculum().getProgram();
        Integer durationYears = program.getDurationYears();
        if (durationYears == null || durationYears <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Program duration years must be greater than zero");
        }

        Month intakeMonth = parseIntakeMonth(batch.getIntakeMonth());
        LocalDate firstSemesterStart = LocalDate.of(batch.getIntakeYear(), intakeMonth, 1);
        int totalSemesters = durationYears * 2;

        for (int i = 0; i < totalSemesters; i++) {
            LocalDate startDate = firstSemesterStart.plusMonths((long) i * 6);
            LocalDate endDate = startDate.plusMonths(6).minusDays(1);

            Semester semester = new Semester();
            semester.setBatch(batch);
            semester.setYearNumber((i / 2) + 1);
            semester.setSemesterNumber((i % 2) + 1);
            semester.setStartDate(startDate);
            semester.setEndDate(endDate);
            semester.setStatus(i == 0 ? "ACTIVE" : "PLANNED");

            semesterRepository.save(semester);
        }
    }

    private void validateSemesterDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Semester start and end dates are required");
        }

        if (startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Semester start date must be before end date");
        }
    }

    private Month parseIntakeMonth(String intakeMonth) {
        if (intakeMonth == null || intakeMonth.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Batch intake month is required");
        }

        String normalized = intakeMonth.trim();
        for (Month month : Month.values()) {
            if (month.getDisplayName(TextStyle.FULL, Locale.ENGLISH).equalsIgnoreCase(normalized)
                    || month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH).equalsIgnoreCase(normalized)) {
                return month;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid intake month. Allowed values: " + Arrays.toString(Month.values())
        );
    }

    private SemesterDtos.Response toResponse(Semester semester) {
        return new SemesterDtos.Response(
                semester.getSemesterId(),
                semester.getYearNumber(),
                semester.getSemesterNumber(),
                semester.getStartDate(),
                semester.getEndDate(),
                semester.getStatus(),
                semester.getBatch() == null ? null : semester.getBatch().getBatchId()
        );
    }
}

