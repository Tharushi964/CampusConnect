package com.campusconnect.repository.component2;

import com.campusconnect.entity.component2.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
	boolean existsByBatch_BatchId(Long batchId);

	boolean existsByBatch_BatchIdAndYearNumberAndSemesterNumber(Long batchId, Integer yearNumber, Integer semesterNumber);

	boolean existsByBatch_BatchIdAndYearNumberAndSemesterNumberAndSemesterIdNot(
			Long batchId,
			Integer yearNumber,
			Integer semesterNumber,
			Long semesterId
	);
}

