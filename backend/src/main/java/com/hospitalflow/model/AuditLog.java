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
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    private String id;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String actor;
    private String eventName;
    private String inputRef;
    private String decision;
    @Column(columnDefinition = "TEXT")
    private String executionResultJson;
}
