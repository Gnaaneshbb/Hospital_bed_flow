package com.hospitalflow.repository;

import com.hospitalflow.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, String> {
    Optional<Staff> findByStaffCode(String staffCode);
    List<Staff> findByDepartmentCode(String departmentCode);
    List<Staff> findByRole(String role);
}
