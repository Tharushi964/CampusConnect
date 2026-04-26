package com.campusconnect.repository.component2;

import com.campusconnect.entity.component2.Subject;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findBySemester_SemesterId(Long semesterId);

    boolean existsByCurriculum_CurriculumIdAndSubjectCodeIgnoreCase(Long curriculumId, String subjectCode);

    boolean existsByCurriculum_CurriculumIdAndSubjectCodeIgnoreCaseAndSubjectIdNot(
            Long curriculumId,
            String subjectCode,
            Long subjectId
    );
}

