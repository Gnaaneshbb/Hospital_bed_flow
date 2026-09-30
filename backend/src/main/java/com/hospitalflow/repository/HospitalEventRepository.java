package com.hospitalflow.repository;

import com.hospitalflow.model.HospitalEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalEventRepository extends JpaRepository<HospitalEvent, String> {
}
