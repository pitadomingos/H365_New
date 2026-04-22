
import { MOCK_LAB_REQUESTS, MOCK_IMAGING_REPORTS, MOCK_PATIENTS } from './mock-data';

export interface ClinicalContext {
  patientName: string;
  age: number;
  gender: string;
  recentLabs: string;
  recentImaging: string;
  medicalHistory: string;
}

/**
 * Fetches relevant clinical data for a patient to provide context for AI recommendations.
 * In a real system, this would query a database. For this SaaS prototype, it uses mock data.
 */
export async function getPatientClinicalContext(nationalId: string): Promise<ClinicalContext | null> {
  // Find basic patient info
  const patient = MOCK_PATIENTS.find(p => p.nationalId === nationalId);
  if (!patient) return null;

  // Find recent lab results
  const labs = MOCK_LAB_REQUESTS
    .filter(lr => lr.nationalId === nationalId && lr.status === 'Results Ready')
    .map(lr => {
      const resultStrings = lr.results?.map(r => `${r.testName}: ${r.value} ${r.unit} (${r.interpretation})`) || [];
      return `Date: ${lr.requestDate}, Tests: ${lr.testsRequested.join(', ')}. Results: ${resultStrings.join('; ')}`;
    })
    .join('\n');

  // Find recent imaging
  const imaging = MOCK_IMAGING_REPORTS
    .filter(ir => ir.nationalId === nationalId)
    .map(ir => `Date: ${ir.requestDate}, Study: ${ir.studyRequested}. Findings: ${ir.report}. Impression: ${ir.impression}`)
    .join('\n');

  return {
    patientName: patient.fullName,
    age: patient.age,
    gender: patient.gender,
    recentLabs: labs || "No recent lab results found.",
    recentImaging: imaging || "No recent imaging reports found.",
    medicalHistory: `District: ${patient.district}, Province: ${patient.province}. Last Visit: ${patient.lastVisit || 'N/A'}.`,
  };
}
