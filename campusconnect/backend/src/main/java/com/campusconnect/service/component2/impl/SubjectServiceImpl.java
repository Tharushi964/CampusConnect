package com.campusconnect.service.component2.impl;

import com.campusconnect.dto.component2.SubjectDtos;
import com.campusconnect.entity.component2.Curriculum;
import com.campusconnect.entity.component2.Semester;
import com.campusconnect.entity.component2.Subject;
import com.campusconnect.repository.component2.CurriculumRepository;
import com.campusconnect.repository.component2.SemesterRepository;
import com.campusconnect.repository.component2.SubjectRepository;
import com.campusconnect.service.component2.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository subjectRepository;
    private final CurriculumRepository curriculumRepository;
    private final SemesterRepository semesterRepository;

    @Override
    public SubjectDtos.Response create(SubjectDtos.Request request) {
        Curriculum curriculum = curriculumRepository.findById(request.curriculumId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curriculum not found: " + request.curriculumId()));
        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + request.semesterId()));        

        Subject subject = new Subject();
        subject.setSubjectCode(request.subjectCode());
        subject.setSubjectName(request.subjectName());
        subject.setCredits(request.credits());
        subject.setCurriculum(curriculum);
        subject.setSemester(semester);
        return toResponse(subjectRepository.save(subject));
    }

    @Override
    public SubjectDtos.Response update(Long subjectId, SubjectDtos.Request request) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found: " + subjectId));

        Curriculum curriculum = curriculumRepository.findById(request.curriculumId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curriculum not found: " + request.curriculumId()));
        
        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Semester not found: " + request.semesterId()));

        subject.setSubjectCode(request.subjectCode());
        subject.setSubjectName(request.subjectName());
        subject.setCredits(request.credits());
        subject.setCurriculum(curriculum);
        subject.setSemester(semester);
        return toResponse(subjectRepository.save(subject));
    }

    @Override
    public SubjectDtos.Response getById(Long subjectId) {
        return subjectRepository.findById(subjectId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found: " + subjectId));
    }

    @Override
    public List<SubjectDtos.Response> getBySemester(Long semesterId) {
        return subjectRepository.findBySemester_SemesterId(semesterId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<SubjectDtos.Response> getAll() {
        return subjectRepository.findAll().stream().map(this::toResponse).toList();
    }


    @Override
    public void delete(Long subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found: " + subjectId);
        }
        subjectRepository.deleteById(subjectId);
    }

    private SubjectDtos.Response toResponse(Subject subject) {
        return new SubjectDtos.Response(
                subject.getSubjectId(),
                subject.getSubjectCode(),
                subject.getSubjectName(),
                subject.getCredits(),
                subject.getCurriculum() == null ? null : subject.getCurriculum().getCurriculumId(),
                subject.getSemester() == null ? null : subject.getSemester().getSemesterId()
        );
    }
}

