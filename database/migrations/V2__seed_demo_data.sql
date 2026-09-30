-- Flyway V2 Migration Seed Demo Data for HOSPITAL FLOW AI

INSERT INTO departments (id, code, name, total_beds, active_staff) VALUES
('DEPT-ER', 'ER', 'Emergency Department', 10, 8),
('DEPT-ICU', 'ICU', 'Intensive Care Unit', 10, 10),
('DEPT-WARD-A', 'WARD_A', 'General Ward A', 10, 6),
('DEPT-WARD-B', 'WARD_B', 'General Ward B', 10, 6),
('DEPT-OR', 'OR', 'Operating Room', 4, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO beds (id, bed_number, department_code, bed_type, status, current_patient_id, estimated_available_mins) VALUES
('BED-ICU-01', 'ICU-01', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P101', 0),
('BED-ICU-02', 'ICU-02', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P102', 0),
('BED-ICU-03', 'ICU-03', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P103', 0),
('BED-ICU-04', 'ICU-04', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P104', 0),
('BED-ICU-05', 'ICU-05', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P105', 0),
('BED-ICU-06', 'ICU-06', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P106', 0),
('BED-ICU-07', 'ICU-07', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P107', 0),
('BED-ICU-08', 'ICU-08', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P108', 0),
('BED-ICU-09', 'ICU-09', 'ICU', 'ICU', 'OCCUPIED', 'PAT-P109', 0),
('BED-ICU-10', 'ICU-10', 'ICU', 'ICU', 'AVAILABLE', NULL, 0),

('BED-WARD-01', 'WARD-01', 'WARD_A', 'WARD', 'OCCUPIED', 'PAT-P110', 0),
('BED-WARD-02', 'WARD-02', 'WARD_A', 'WARD', 'OCCUPIED', 'PAT-P111', 0),
('BED-WARD-03', 'WARD-03', 'WARD_A', 'WARD', 'OCCUPIED', 'PAT-P112', 0),
('BED-WARD-04', 'WARD-04', 'WARD_A', 'WARD', 'AVAILABLE', NULL, 0),
('BED-WARD-05', 'WARD-05', 'WARD_A', 'WARD', 'AVAILABLE', NULL, 0),
('BED-WARD-06', 'WARD-06', 'WARD_A', 'WARD', 'CLEANING', NULL, 15),
('BED-WARD-07', 'WARD-07', 'WARD_B', 'WARD', 'OCCUPIED', 'PAT-P113', 0),
('BED-WARD-08', 'WARD-08', 'WARD_B', 'WARD', 'OCCUPIED', 'PAT-P114', 0),
('BED-WARD-09', 'WARD-09', 'WARD_B', 'WARD', 'AVAILABLE', NULL, 0),
('BED-WARD-10', 'WARD-10', 'WARD_B', 'WARD', 'CLEANING', NULL, 20),

('BED-ER-01', 'ER-01', 'ER', 'ER', 'OCCUPIED', 'PAT-P115', 0),
('BED-ER-02', 'ER-02', 'ER', 'ER', 'OCCUPIED', 'PAT-P116', 0),
('BED-ER-03', 'ER-03', 'ER', 'ER', 'AVAILABLE', NULL, 0),
('BED-ER-04', 'ER-04', 'ER', 'ER', 'AVAILABLE', NULL, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (id, patient_code, age, gender, severity, vitals_status, required_care_level, physician_clearance, status, assigned_bed_id) VALUES
('PAT-P101', 'P101', 68, 'M', 'HIGH', 'GUARDED', 'ICU', FALSE, 'ADMITTED_ICU', 'BED-ICU-01'),
('PAT-P102', 'P102', 72, 'F', 'CRITICAL', 'UNSTABLE', 'ICU', FALSE, 'ADMITTED_ICU', 'BED-ICU-02'),
('PAT-P103', 'P103', 54, 'M', 'MODERATE', 'STABLE', 'ICU', TRUE, 'ADMITTED_ICU', 'BED-ICU-03'),
('PAT-P104', 'P104', 81, 'F', 'CRITICAL', 'UNSTABLE', 'ICU', FALSE, 'ADMITTED_ICU', 'BED-ICU-04'),
('PAT-P105', 'P105', 49, 'M', 'HIGH', 'STABLE', 'ICU', FALSE, 'ADMITTED_ICU', 'BED-ICU-05'),
('PAT-P106', 'P106', 61, 'F', 'HIGH', 'GUARDED', 'ICU', FALSE, 'ADMITTED_ICU', 'BED-ICU-06'),
('PAT-P107', 'P107', 59, 'M', 'MODERATE', 'STABLE', 'ICU', TRUE, 'ADMITTED_ICU', 'BED-ICU-07'),
('PAT-P108', 'P108', 75, 'F', 'CRITICAL', 'UNSTABLE', 'ICU', FALSE, 'ADMITTED_ICU', 'BED-ICU-08'),
('PAT-P109', 'P109', 42, 'M', 'HIGH', 'GUARDED', 'ICU', FALSE, 'ADMITTED_ICU', 'BED-ICU-09'),

('PAT-P110', 'P110', 38, 'F', 'LOW', 'STABLE', 'WARD', TRUE, 'ADMITTED_WARD', 'BED-WARD-01'),
('PAT-P111', 'P111', 45, 'M', 'MODERATE', 'STABLE', 'WARD', FALSE, 'ADMITTED_WARD', 'BED-WARD-02'),
('PAT-P112', 'P112', 63, 'F', 'LOW', 'STABLE', 'WARD', TRUE, 'ADMITTED_WARD', 'BED-WARD-03'),
('PAT-P113', 'P113', 29, 'M', 'LOW', 'STABLE', 'WARD', TRUE, 'ADMITTED_WARD', 'BED-WARD-07'),
('PAT-P114', 'P114', 51, 'F', 'MODERATE', 'STABLE', 'WARD', FALSE, 'ADMITTED_WARD', 'BED-WARD-08'),

('PAT-P115', 'P115', 66, 'M', 'CRITICAL', 'UNSTABLE', 'ICU', FALSE, 'ER_WAITING', 'BED-ER-01'),
('PAT-P116', 'P116', 58, 'F', 'HIGH', 'GUARDED', 'MONITORED_WARD', FALSE, 'ER_WAITING', 'BED-ER-02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO staff (id, staff_code, name, role, department_code, shift, status, workload_score) VALUES
('STF-D01', 'DOC-D01', 'Dr. Sarah Jenkins', 'DOCTOR', 'ICU', 'DAY', 'ON_DUTY', 78),
('STF-D02', 'DOC-D02', 'Dr. Marcus Vance', 'DOCTOR', 'ER', 'DAY', 'ON_DUTY', 92),
('STF-N01', 'NURSE-N10', 'Elena Rostova, RN', 'NURSE', 'ER', 'DAY', 'OVERLOADED', 94),
('STF-N02', 'NURSE-N11', 'James Carter, RN', 'NURSE', 'ER', 'DAY', 'ON_DUTY', 88),
('STF-N03', 'NURSE-N17', 'Samantha Blake, RN', 'NURSE', 'WARD_A', 'DAY', 'AVAILABLE', 45),
('STF-N04', 'NURSE-N18', 'David Kim, RN', 'NURSE', 'WARD_B', 'DAY', 'AVAILABLE', 52),
('STF-C01', 'CLEAN-C01', 'Robert Hayes', 'CLEANER', 'WARD_A', 'DAY', 'ON_DUTY', 85)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cleaning_tasks (id, bed_id, cleaner_id, status, est_completion_mins) VALUES
('CLN-01', 'BED-WARD-06', 'STF-C01', 'IN_PROGRESS', 15),
('CLN-02', 'BED-WARD-10', 'STF-C01', 'PENDING', 20)
ON CONFLICT (id) DO NOTHING;
