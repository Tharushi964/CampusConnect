package com.campusconnect.repository.component2;

import com.campusconnect.entity.component2.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {
	boolean existsByProgram_ProgramIdAndCurriculumNameIgnoreCase(Long programId, String curriculumName);

	boolean existsByProgram_ProgramIdAndCurriculumNameIgnoreCaseAndCurriculumIdNot(
			Long programId,
			String curriculumName,
			Long curriculumId
	);
}

