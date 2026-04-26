package com.campusconnect.service.component2.impl;

import com.campusconnect.dto.component2.CurriculumDtos;
import com.campusconnect.entity.component2.Curriculum;
import com.campusconnect.entity.component2.Program;
import com.campusconnect.repository.component2.CurriculumRepository;
import com.campusconnect.repository.component2.ProgramRepository;
import com.campusconnect.service.component2.CurriculumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CurriculumServiceImpl implements CurriculumService {
    private final CurriculumRepository curriculumRepository;
    private final ProgramRepository programRepository;

    @Override
    public CurriculumDtos.Response create(CurriculumDtos.Request request) {
        if (request.programId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Program is required");
        }

        boolean duplicateExists = curriculumRepository.existsByProgram_ProgramIdAndCurriculumNameIgnoreCase(
                request.programId(),
                request.curriculumName()
        );
        if (duplicateExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Curriculum already exists for this program"
            );
        }

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found: " + request.programId()));

        Curriculum curriculum = new Curriculum();
        curriculum.setCurriculumName(request.curriculumName());
        curriculum.setVersion(request.version());
        curriculum.setCreatedYear(request.createdYear());
        curriculum.setStatus(request.status());
        curriculum.setProgram(program);
        return toResponse(curriculumRepository.save(curriculum));
    }

    @Override
    public CurriculumDtos.Response update(Long curriculumId, CurriculumDtos.Request request) {
        if (request.programId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Program is required");
        }

        boolean duplicateExists = curriculumRepository.existsByProgram_ProgramIdAndCurriculumNameIgnoreCaseAndCurriculumIdNot(
                request.programId(),
                request.curriculumName(),
                curriculumId
        );
        if (duplicateExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another curriculum with this name already exists for the selected program"
            );
        }

        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curriculum not found: " + curriculumId));

        Program program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Program not found: " + request.programId()));

        curriculum.setCurriculumName(request.curriculumName());
        curriculum.setVersion(request.version());
        curriculum.setCreatedYear(request.createdYear());
        curriculum.setStatus(request.status());
        curriculum.setProgram(program);
        return toResponse(curriculumRepository.save(curriculum));
    }

    @Override
    public CurriculumDtos.Response getById(Long curriculumId) {
        return curriculumRepository.findById(curriculumId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curriculum not found: " + curriculumId));
    }

    @Override
    public List<CurriculumDtos.Response> getAll() {
        return curriculumRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long curriculumId) {
        if (!curriculumRepository.existsById(curriculumId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Curriculum not found: " + curriculumId);
        }
        curriculumRepository.deleteById(curriculumId);
    }

    private CurriculumDtos.Response toResponse(Curriculum curriculum) {
        return new CurriculumDtos.Response(
                curriculum.getCurriculumId(),
                curriculum.getCurriculumName(),
                curriculum.getVersion(),
                curriculum.getCreatedYear(),
                curriculum.getStatus(),
                curriculum.getProgram() == null ? null : curriculum.getProgram().getProgramId()
        );
    }
}

