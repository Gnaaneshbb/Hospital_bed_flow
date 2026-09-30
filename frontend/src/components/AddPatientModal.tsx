import React, { useState } from 'react';
import type { Bed, Patient, Severity } from '../types/hospital';
import { UserPlus, X, HeartPulse, Stethoscope, BedDouble, AlertCircle } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBeds: Bed[];
  onAddPatient: (patient: Partial<Patient>) => Promise<void>;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  availableBeds,
  onAddPatient,
}) => {
  const [patientCode, setPatientCode] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [severity, setSeverity] = useState<Severity>('MODERATE');
  const [vitalsStatus, setVitalsStatus] = useState<'STABLE' | 'UNSTABLE' | 'GUARDED'>('STABLE');
  const [requiredCareLevel, setRequiredCareLevel] = useState<'ICU' | 'MONITORED_WARD' | 'WARD' | 'ER_OBSERVATION'>('WARD');
  const [physicianClearance, setPhysicianClearance] = useState<boolean>(true);
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientCode.trim()) {
      setError('Please provide a patient code (e.g. P125).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const initialStatus = selectedBedId
        ? selectedBedId.includes('ICU')
          ? 'ADMITTED_ICU'
          : 'ADMITTED_WARD'
        : 'ER_WAITING';

      await onAddPatient({
        patientCode: patientCode.trim().toUpperCase(),
        age: Number(age),
        gender,
        severity,
        vitalsStatus,
        requiredCareLevel,
        physicianClearance,
        status: initialStatus,
        assignedBedId: selectedBedId || null,
      });

      // Reset and close
      setPatientCode('');
      setSelectedBedId('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add patient.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-['Outfit']">Manual Patient Admission & Intake</h3>
            <p className="text-xs text-slate-400">Add a new patient to test bed flow, triage, and multi-agent approvals</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/40 text-red-300 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Patient Code & Demographics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1">
              <label className="text-slate-300 font-bold block">Patient Code *</label>
              <input
                type="text"
                placeholder="e.g. P125"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-slate-300 font-bold block">Age</label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-slate-300 font-bold block">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2: Triage Acuity & Care Level */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Triage Severity Acuity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="CRITICAL">CRITICAL (Resuscitation)</option>
                <option value="HIGH">HIGH (Emergent)</option>
                <option value="MODERATE">MODERATE (Urgent)</option>
                <option value="LOW">LOW (Non-Urgent)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Required Care Level</label>
              <select
                value={requiredCareLevel}
                onChange={(e) => setRequiredCareLevel(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="ICU">ICU (Intensive Care)</option>
                <option value="MONITORED_WARD">MONITORED_WARD (Telemetry)</option>
                <option value="WARD">WARD (General Recovery)</option>
                <option value="ER_OBSERVATION">ER_OBSERVATION (Holding)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Vitals & Physician Step-down Clearance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                Continuous Vitals Status
              </label>
              <select
                value={vitalsStatus}
                onChange={(e) => setVitalsStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="STABLE">STABLE (Hemodynamically Normal)</option>
                <option value="GUARDED">GUARDED (Borderline / Monitor)</option>
                <option value="UNSTABLE">UNSTABLE (Labile / High Risk)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                Physician Step-Down Clearance
              </label>
              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={physicianClearance}
                    onChange={(e) => setPhysicianClearance(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">Doctor Clearance Signed</span>
                </label>
              </div>
            </div>
          </div>

          {/* Row 4: Initial Bed Assignment */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-blue-400" />
              Initial Bed Placement (Optional)
            </label>
            <select
              value={selectedBedId}
              onChange={(e) => setSelectedBedId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
            >
              <option value="">No Bed Assigned (Hold in ER Waiting Queue)</option>
              {availableBeds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.bedNumber} ({bed.bedType} - {bed.departmentCode}) • AVAILABLE
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">
              {availableBeds.length} vacant bed(s) currently ready. Selecting a bed will instantly occupy it with this patient.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-blue-950/50 transition-all disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Admitting...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Admit Patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
