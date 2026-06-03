import fs from 'fs';
import path from 'path';
import { MOCK_PATIENTS } from './mock-data';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'patients.json');

// Interface definition matching the structure of each patient record
export interface PatientRecord {
  id: string;
  nationalId: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  dateOfBirth: string;
  photoUrl: string;
  district: string;
  province: string;
  lastVisit?: string;
  status?: string;
  location?: string;
  timeAdded?: string;
  allergies?: string[];
  chronicConditions?: string[];
  email?: string;
  phone?: string;
  address?: string;
  nextOfKinName?: string;
  nextOfKinRelation?: string;
  nextOfKinPhone?: string;
  nextOfKinAddress?: string;
  medications: any[];
  visits: any[];
  labs: any[];
}

function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    // Generate initial seeded patient database from MOCK_PATIENTS
    const initialRecords: PatientRecord[] = MOCK_PATIENTS.map((p) => {
      // Default mock records for our main mock patients
      const medSeed = [
        { 
          id: 1, 
          name: 'Lisinopril', 
          dosage: '10mg', 
          frequency: 'Once daily (Morning)', 
          reason: 'Hypertension',
          reminders: '08:00 AM',
          instructions: 'Take with water before breakfast.',
          pillColor: 'bg-blue-400',
          adherenceLog: []
        },
        { 
          id: 2, 
          name: 'Metformin', 
          dosage: '500mg', 
          frequency: 'Twice daily (Morning/Evening)', 
          reason: 'Blood Glucose Control',
          reminders: '08:00 AM, 08:00 PM',
          instructions: 'Take with food to minimize stomach upset.',
          pillColor: 'bg-orange-400',
          adherenceLog: []
        }
      ];

      const visitSeed = [
        { id: 1, date: '2026-05-02', dept: 'Internal Medicine', reason: 'HTN Follow-up', doctor: 'Dr. Santos', facility: 'Central General Hospital' },
        { id: 2, date: '2026-03-15', dept: 'Cardiology', reason: 'Initial Assessment', doctor: 'Dr. Martins', facility: 'Regional Specialty Center' },
        { id: 3, date: '2026-02-10', dept: 'Laboratory', reason: 'Routine CBC/Lipids', facility: 'Main Laboratory' },
        { id: 4, date: '2025-12-20', dept: 'General Practice', reason: 'Flu Symptoms', doctor: 'Dr. Silva', facility: 'District Clinic' }
      ];

      const labSeed = [
        { id: 1, test: 'Complete Blood Count (CBC)', date: '2026-02-12', status: 'Normal', results: 'Hb: 14.2 g/dL, WBC: 6.5 x10^9/L' },
        { id: 2, test: 'Lipid Profile', date: '2026-02-12', status: 'Elevated', results: 'Total Chol: 210 mg/dL, LDL: 135 mg/dL' },
        { id: 3, test: 'Glucose (Fasting)', date: '2025-06-10', status: 'Normal', results: '92 mg/dL' }
      ];

      return {
        id: p.id,
        nationalId: p.nationalId,
        fullName: p.fullName,
        gender: p.gender,
        age: p.age,
        dateOfBirth: p.dateOfBirth,
        photoUrl: p.photoUrl || 'https://picsum.photos/seed/patient/200',
        district: p.district,
        province: p.province,
        lastVisit: p.lastVisit,
        status: p.status,
        location: p.location,
        timeAdded: p.timeAdded,
        allergies: p.allergies || ['Penicillin', 'Latex'],
        chronicConditions: p.chronicConditions || ['Hypertension'],
        email: p.fullName.toLowerCase().split(' ')[0] + '@email.mz',
        phone: '+258 84 123 4567',
        address: 'Av. Eduardo Mondlane, Maputo',
        nextOfKinName: 'Fátima ' + p.fullName.split(' ').slice(-1)[0],
        nextOfKinRelation: 'Spouse',
        nextOfKinPhone: '+258 82 987 6543',
        medications: medSeed,
        visits: visitSeed,
        labs: labSeed
      };
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(initialRecords, null, 2), 'utf-8');
  }
}

export function getAllPatients(): PatientRecord[] {
  initDB();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON DB file:', error);
    return [];
  }
}

export function saveAllPatients(patients: PatientRecord[]) {
  initDB();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(patients, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing JSON DB file:', error);
  }
}

export function findPatientByNid(nationalId: string): PatientRecord | undefined {
  const patients = getAllPatients();
  return patients.find(p => p.nationalId === nationalId);
}

export function registerPatient(patientData: Partial<PatientRecord>): PatientRecord {
  const patients = getAllPatients();
  
  // Clean dates and verify types
  const newPatient: PatientRecord = {
    id: patientData.id || `P-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    nationalId: patientData.nationalId || '',
    fullName: patientData.fullName || '',
    gender: patientData.gender || 'Other',
    age: patientData.age || 0,
    dateOfBirth: patientData.dateOfBirth || '',
    photoUrl: patientData.photoUrl || 'https://picsum.photos/seed/patient/200',
    district: patientData.district || 'Maputo',
    province: patientData.province || 'Maputo Cidade',
    lastVisit: patientData.lastVisit || new Date().toISOString().split('T')[0],
    status: patientData.status || 'Registered',
    location: patientData.location || 'Outpatient',
    timeAdded: patientData.timeAdded || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    allergies: patientData.allergies || [],
    chronicConditions: patientData.chronicConditions || [],
    email: patientData.email || '',
    phone: patientData.phone || '',
    address: patientData.address || '',
    nextOfKinName: patientData.nextOfKinName || '',
    nextOfKinRelation: patientData.nextOfKinRelation || 'Spouse',
    nextOfKinPhone: patientData.nextOfKinPhone || '',
    medications: patientData.medications || [
      { 
        id: 1, 
        name: 'Lisinopril', 
        dosage: '10mg', 
        frequency: 'Once daily (Morning)', 
        reason: 'Hypertension',
        reminders: '08:00 AM',
        instructions: 'Take with water before breakfast.',
        pillColor: 'bg-blue-400',
        adherenceLog: []
      }
    ],
    visits: patientData.visits || [
      { id: 1, date: new Date().toISOString().split('T')[0], dept: 'General Practice', reason: 'Registration Consultation', doctor: 'Dr. Auto', facility: 'Central General Hospital' }
    ],
    labs: patientData.labs || []
  };

  patients.unshift(newPatient);
  saveAllPatients(patients);
  return newPatient;
}

export function updatePatientProfile(nationalId: string, profileUpdates: Partial<PatientRecord>): PatientRecord | null {
  const patients = getAllPatients();
  const index = patients.findIndex(p => p.nationalId === nationalId);
  
  if (index === -1) return null;

  patients[index] = {
    ...patients[index],
    ...profileUpdates
  };

  saveAllPatients(patients);
  return patients[index];
}

export function confirmMedicationIntake(nationalId: string, medId: number): boolean {
  const patients = getAllPatients();
  const index = patients.findIndex(p => p.nationalId === nationalId);
  
  if (index === -1) return false;

  const patient = patients[index];
  const medIndex = patient.medications.findIndex(m => m.id === medId);
  
  if (medIndex === -1) return false;

  const timestamp = new Date().toISOString();
  if (!patient.medications[medIndex].adherenceLog) {
    patient.medications[medIndex].adherenceLog = [];
  }
  patient.medications[medIndex].adherenceLog.push(timestamp);

  patients[index] = patient;
  saveAllPatients(patients);
  return true;
}
