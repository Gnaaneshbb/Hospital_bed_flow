package com.hospitalflow.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalEvent {
    @Id
    private String id;
    private String eventType;
    @Column(columnDefinition = "TEXT")
    private String payloadJson;
    private LocalDateTime createdAt = LocalDateTime.now();
}
