
/**
 * Real-world mock data for HealthFlow Public Hospital Platform.
 * Centralized store to ensure consistency across the prototype.
 */

export interface MockPatient {
  id: string;
  nationalId: string;
  fullName: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  dateOfBirth: string;
  photoUrl: string;
  district: string;
  province: string;
  lastVisit?: string;
  status?: string;
  location?: string;
  timeAdded?: string;
}

export const MOCK_PATIENTS: MockPatient[] = [
  {
    id: "P001",
    nationalId: "1029384756",
    fullName: "Alice Mwamba",
    gender: "Female",
    age: 28,
    dateOfBirth: "1998-05-14",
    photoUrl: "https://placehold.co/100x100.png?text=Alice",
    district: "Chongwe",
    province: "Lusaka",
    lastVisit: "2026-04-15",
    status: "Waiting for Doctor",
    location: "Outpatient",
    timeAdded: "08:15 AM"
  },
  {
    id: "P002",
    nationalId: "5647382910",
    fullName: "Emmanuel Phiri",
    gender: "Male",
    age: 45,
    dateOfBirth: "1981-11-22",
    photoUrl: "https://placehold.co/100x100.png?text=Emmanuel",
    district: "Kafue",
    province: "Lusaka",
    lastVisit: "2026-04-18",
    status: "Awaiting Lab Results",
    location: "Laboratory",
    timeAdded: "09:30 AM"
  },
  {
    id: "P003",
    nationalId: "9988776655",
    fullName: "Grace Tembo",
    gender: "Female",
    age: 32,
    dateOfBirth: "1994-02-08",
    photoUrl: "https://placehold.co/100x100.png?text=Grace",
    district: "Luangwa",
    province: "Lusaka",
    lastVisit: "2026-04-19",
    status: "Scheduled Procedure",
    location: "Surgical Ward",
    timeAdded: "07:45 AM"
  },
  {
    id: "P004",
    nationalId: "4433221100",
    fullName: "Joseph Banda",
    gender: "Male",
    age: 67,
    dateOfBirth: "1959-07-30",
    photoUrl: "https://placehold.co/100x100.png?text=Joseph",
    district: "Chilanga",
    province: "Lusaka",
    lastVisit: "2026-03-12",
    status: "Follow-up",
    location: "General Medicine",
    timeAdded: "10:00 AM"
  },
  {
    id: "P005",
    nationalId: "1231231234",
    fullName: "Sarah Zulu",
    gender: "Female",
    age: 24,
    dateOfBirth: "2002-09-12",
    photoUrl: "https://placehold.co/100x100.png?text=Sarah",
    district: "Rufunsa",
    province: "Lusaka",
    lastVisit: "2026-04-20",
    status: "Ante-natal Checkup",
    location: "Maternity Care",
    timeAdded: "08:45 AM"
  }
];

export const MOCK_RECENT_ACTIVITY = [
  { user: "Dr. Mutale", action: "signed off lab results for Alice Mwamba", time: "5 min ago" },
  { user: "Receptionist Mary", action: "registered new patient: Emmanuel Phiri", time: "12 min ago" },
  { user: "Nurse Chansa", action: "updated vitals for Grace Tembo", time: "25 min ago" },
  { user: "Pharmacist John", action: "dispensed Amoxicillin to Joseph Banda", time: "1 hour ago" },
  { user: "Dr. Phiri", action: "discharged Sarah Zulu from Ward A", time: "2 hours ago" },
];

export const MOCK_DRAFTS = [
  { id: "D1", patientName: "Pending: Alice Mwamba", specialtyOrReason: "Awaiting Lab Results (Cardiology)", lastSavedTime: "1h ago" },
  { id: "D2", patientName: "Pending: Emmanuel Phiri", specialtyOrReason: "Imaging Ordered (Neurology)", lastSavedTime: "3h ago" },
  { id: "D3", patientName: "Pending: Grace Tembo", specialtyOrReason: "Surgical Prep Notes", lastSavedTime: "Yesterday" },
];

export const MOCK_PHARMACY_STOCK = [
  { name: "Amoxicillin 500mg", quantity: 1250, unit: "Capsules", status: "In Stock" },
  { name: "Paracetamol 500mg", quantity: 5000, unit: "Tablets", status: "In Stock" },
  { name: "Artemether/Lumefantrine", quantity: 450, unit: "Treatments", status: "Low Stock" },
  { name: "Ibuprofen 400mg", quantity: 2100, unit: "Tablets", status: "In Stock" },
  { name: "Metformin 500mg", quantity: 180, unit: "Tablets", status: "Critical" },
];

export const MOCK_WARD_OCCUPANCY = [
  { ward: "Ward A (Medical)", totalBeds: 20, occupied: 18, pendingDischarge: 4 },
  { ward: "Ward B (Surgical)", totalBeds: 15, occupied: 12, pendingDischarge: 2 },
  { ward: "Maternity Ward", totalBeds: 25, occupied: 15, pendingDischarge: 8 },
  { ward: "Pediatric Ward", totalBeds: 20, occupied: 10, pendingDischarge: 3 },
  { ward: "Emergency Observation", totalBeds: 10, occupied: 9, pendingDischarge: 5 },
];

export const MOCK_LAB_REQUESTS = [
  { id: "LR001", patientName: "Alice Mwamba", nationalId: "1029384756", testsRequested: ["hemoglobin", "glucose_random", "urinalysis_re"], orderingDoctor: "Dr. Mutale", requestDate: "2026-04-20", status: "Sample Pending" },
  { id: "LR002", patientName: "Emmanuel Phiri", nationalId: "5647382910", testsRequested: ["wbc_count", "platelet_count", "creatinine_serum"], orderingDoctor: "Dr. Phiri", requestDate: "2026-04-20", status: "Processing" },
  { id: "LR003", patientName: "Grace Tembo", nationalId: "9988776655", testsRequested: ["tsh", "free_t4"], orderingDoctor: "Dr. Mutale", requestDate: "2026-04-19", status: "Results Ready", results: [{testId: "tsh", testName:"TSH", value: "2.5", unit: "mIU/L", normalRangeDisplay: "0.4-4.0", interpretation: "Normal", isNumeric:true}, {testId: "free_t4", testName:"Free T4", value:"1.2", unit:"ng/dL", normalRangeDisplay: "0.8-1.8", interpretation: "Normal", isNumeric:true}]},
];

export const MOCK_WARD_PATIENTS = [
  { id: "W001", name: "Alice Mwamba", diagnosis: "Pneumonia", ward: "Ward A (Medical)", bed: "Bed 04", admissionDate: "2026-04-15" },
  { id: "W002", name: "Emmanuel Phiri", diagnosis: "Heart Failure", ward: "Ward A (Medical)", bed: "Bed 12", admissionDate: "2026-04-18" },
  { id: "W003", name: "Grace Tembo", diagnosis: "Post-Appendectomy", ward: "Ward B (Surgical)", bed: "Bed 01", admissionDate: "2026-04-19" },
];

export const MOCK_MATERNITY_PATIENTS = [
  {
    id: "MP001",
    nationalId: "1231231234",
    fullName: "Sarah Zulu",
    age: 24,
    gender: "Female",
    photoUrl: "https://placehold.co/100x100.png?text=Sarah",
    lmp: "2026-03-01",
    edd: "2026-12-06",
    gestationalAge: "24w 5d",
    gravida: "1",
    para: "0",
    bloodGroup: "O+",
    rhFactor: "Positive",
    allergies: ["Penicillin"],
    chronicConditions: ["None"],
    riskFactors: ["None Identified"],
    antenatalVisits: [],
  }
];
