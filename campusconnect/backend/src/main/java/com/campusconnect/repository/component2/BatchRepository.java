package com.campusconnect.repository.component2;

import com.campusconnect.entity.component2.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
	boolean existsByCampus_CampusIdAndIntakeYearAndIntakeMonth(Long campusId, Integer intakeYear, String intakeMonth);

	boolean existsByCampus_CampusIdAndIntakeYearAndIntakeMonthAndBatchIdNot(
			Long campusId,
			Integer intakeYear,
			String intakeMonth,
			Long batchId
	);

	boolean existsByCampus_CampusIdAndStatusIgnoreCase(Long campusId, String status);
}

