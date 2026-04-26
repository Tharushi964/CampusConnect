package com.campusconnect.service.component2.impl;

import com.campusconnect.dto.component2.BatchDtos;
import com.campusconnect.entity.component2.Batch;
import com.campusconnect.entity.component2.Campus;
import com.campusconnect.entity.component2.Curriculum;
import com.campusconnect.repository.component2.BatchRepository;
import com.campusconnect.repository.component2.CampusRepository;
import com.campusconnect.repository.component2.CurriculumRepository;
import com.campusconnect.service.component2.BatchService;
import com.campusconnect.service.component2.SemesterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {
    private final BatchRepository batchRepository;
    private final CampusRepository campusRepository;
    private final CurriculumRepository curriculumRepository;
    private final SemesterService semesterService;

    @Override
    public BatchDtos.Response create(BatchDtos.Request request) {
        if (request.curriculumId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Curriculum is required to create batch");
        }

        Campus campus = campusRepository.findById(request.campusId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campus not found: " + request.campusId()));

        boolean duplicateExists = batchRepository.existsByCampus_CampusIdAndIntakeYearAndIntakeMonth(
            request.campusId(),
            request.intakeYear(),
            request.intakeMonth()
        );

        if (duplicateExists) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Batch already exists for the selected campus and intake period"
            );
        }

        Curriculum curriculum = curriculumRepository.findById(request.curriculumId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Curriculum not found: " + request.curriculumId()
            ));

        Batch batch = new Batch();
        batch.setIntakeYear(request.intakeYear());
        batch.setIntakeMonth(request.intakeMonth());
        batch.setBatchName(request.batchName());
        batch.setStatus(request.status());
        batch.setCampus(campus);
        batch.setCurriculum(curriculum);
        batch.setCreatedAt(LocalDateTime.now());

        Batch savedBatch = batchRepository.save(batch);
        semesterService.generateSemestersForBatch(savedBatch);
        return toResponse(savedBatch);
    }

    @Override
    public BatchDtos.Response update(Long batchId, BatchDtos.Request request) {
        if (request.curriculumId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Curriculum is required to update batch");
        }

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found: " + batchId));

        Campus campus = campusRepository.findById(request.campusId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campus not found: " + request.campusId()));

        boolean duplicateExists = batchRepository.existsByCampus_CampusIdAndIntakeYearAndIntakeMonthAndBatchIdNot(
            request.campusId(),
            request.intakeYear(),
            request.intakeMonth(),
            batchId
        );

        if (duplicateExists) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Another batch already exists for the selected campus and intake period"
            );
        }

        Curriculum curriculum = curriculumRepository.findById(request.curriculumId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Curriculum not found: " + request.curriculumId()
            ));

        batch.setBatchName(request.batchName());
        batch.setIntakeYear(request.intakeYear());
        batch.setIntakeMonth(request.intakeMonth());
        batch.setStatus(request.status());
        batch.setCampus(campus);
        batch.setCurriculum(curriculum);
        return toResponse(batchRepository.save(batch));
    }

    @Override
    public BatchDtos.Response getById(Long batchId) {
        return batchRepository.findById(batchId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found: " + batchId));
    }

    @Override
    public List<BatchDtos.Response> getAll() {
        return batchRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long batchId) {
        if (!batchRepository.existsById(batchId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found: " + batchId);
        }
        batchRepository.deleteById(batchId);
    }

    private BatchDtos.Response toResponse(Batch batch) {
        return new BatchDtos.Response(
                batch.getBatchId(),
                batch.getBatchName(),
                batch.getIntakeYear(),
                batch.getIntakeMonth(),
                batch.getStatus(),
                batch.getCreatedAt(),
                batch.getCampus() == null ? null : batch.getCampus().getCampusId(),
                batch.getCurriculum() == null ? null : batch.getCurriculum().getCurriculumId()
        );
    }
}

