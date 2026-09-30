package com.hospitalflow.repository;

import com.hospitalflow.model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, String> {
    Optional<Bed> findByBedNumber(String bedNumber);
    List<Bed> findByDepartmentCode(String departmentCode);
    List<Bed> findByStatus(String status);
    List<Bed> findByBedTypeAndStatus(String bedType, String status);
}
