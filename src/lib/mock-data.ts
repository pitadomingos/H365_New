
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
    fullName: "Li-Rieal Antonio Pita Domingos",
    gender: "Female",
    age: 28,
    dateOfBirth: "1998-05-14",
    photoUrl: "https://placehold.co/100x100.png?text=Alice",
    district: "Tete",
    province: "Tete",
    lastVisit: "2026-04-15",
    status: "Waiting for Doctor",
    location: "Outpatient",
    timeAdded: "08:15 AM"
  },
  {
    id: "P002",
    nationalId: "5647382910",
    fullName: "Delfina Correia Domingos",
    gender: "Female",
    age: 45,
    dateOfBirth: "1981-11-22",
    photoUrl: "https://placehold.co/100x100.png?text=Emmanuel",
    district: "Tete",
    province: "Tete",
    lastVisit: "2026-04-18",
    status: "Awaiting Lab Results",
    location: "Laboratory",
    timeAdded: "09:30 AM"
  },
  {
    id: "P003",
    nationalId: "9988776655",
    fullName: "Graciela Tembanne",
    gender: "Female",
    age: 32,
    dateOfBirth: "1994-02-08",
    photoUrl: "https://placehold.co/100x100.png?text=Grace",
    district: "Angonia",
    province: "Tete",
    lastVisit: "2026-04-19",
    status: "Scheduled Procedure",
    location: "Surgical Ward",
    timeAdded: "07:45 AM"
  },
  {
    id: "P004",
    nationalId: "4433221100",
    fullName: "Josefa Lobo",
    gender: "Female",
    age: 45,
    dateOfBirth: "1981-11-22",
    photoUrl: "https://placehold.co/100x100.png?text=Joseph",
    district: "Tete",
    province: "Tete",
    lastVisit: "2026-03-12",
    status: "Follow-up",
    location: "General Medicine",
    timeAdded: "10:00 AM"
  },
  {
    id: "P005",
    nationalId: "1231231234",
    fullName: "Sarah Capairor",
    gender: "Female",
    age: 24,
    dateOfBirth: "2002-09-12",
    photoUrl: "https://placehold.co/100x100.png?text=Sarah",
    district: "Dondo",
    province: "Sofala",
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

export const MOCK_IMAGING_REPORTS = [
  { 
    id: "IMG001", 
    patientName: "Alice Mwamba", 
    nationalId: "1029384756", 
    studyRequested: "Chest X-Ray (PA View)", 
    requestDate: "2026-04-15", 
    report: "Lungs are clear. No pleural effusions or pneumothorax. Cardiomediastinal silhouette is within normal limits. Bony structures are intact.",
    impression: "Normal Chest X-Ray."
  },
  { 
    id: "IMG002", 
    patientName: "Emmanuel Phiri", 
    nationalId: "5647382910", 
    studyRequested: "MRI Brain", 
    requestDate: "2026-04-18", 
    report: "No acute intracranial hemorrhage or territorial infarct. Ventricular system and subarachnoid spaces are normal for age. No abnormal enhancement.",
    impression: "Unremarkable Brain MRI."
  },
  {
    id: "IMG003",
    patientName: "Grace Tembo",
    nationalId: "9988776655",
    studyRequested: "Ultrasound Abdomen",
    requestDate: "2026-04-19",
    report: "Liver is normal in size and echotexture. Gallbladder contains no stones. Spleen and pancreas appear normal. Kidneys are within normal size with no hydronephrosis.",
    impression: "Normal abdominal ultrasound."
  }
];

export const MOCK_FACILITY_PERFORMANCE = [
  { name: "Central General", patients: 1240, occupancy: 92, qualityScore: 95, color: "hsl(var(--chart-1))" },
  { name: "District Hospital A", patients: 850, occupancy: 75, qualityScore: 88, color: "hsl(var(--chart-2))" },
  { name: "St. Mary Clinic", patients: 420, occupancy: 60, qualityScore: 91, color: "hsl(var(--chart-3))" },
  { name: "Rural Health Unit B", patients: 150, occupancy: 40, qualityScore: 75, color: "hsl(var(--chart-4))" },
  { name: "Main Maternity Center", patients: 680, occupancy: 85, qualityScore: 98, color: "hsl(var(--chart-5))" },
];

export const MOCK_REGIONAL_RESOURCES = [
  { region: "North District", doctors: 45, ambulances: 8, oxygenStock: 85 },
  { region: "South District", doctors: 32, ambulances: 5, oxygenStock: 40 },
  { region: "East District", doctors: 28, ambulances: 3, oxygenStock: 65 },
  { region: "West District", doctors: 50, ambulances: 12, oxygenStock: 95 },
];

export const MOCK_RECURRING_INFECTIONS = [
  { name: "Malaria", cases: 450, trend: "up", facilities: ["District Hospital A", "St. Mary Clinic"] },
  { name: "Cholera", cases: 12, trend: "down", facilities: ["Central General"] },
  { name: "COVID-19", cases: 85, trend: "stable", facilities: ["North Clinic", "District Hospital A"] },
  { name: "Tuberculosis", cases: 120, trend: "up", facilities: ["Central General", "West Health Post"] },
];

export const MOCK_CAMPAIGNS = [
  { name: "National Vaccination Day", progress: 75, status: "Active", reach: "850k" },
  { name: "Malaria Prevention Week", progress: 100, status: "Completed", reach: "1.2M" },
  { name: "Maternal Health Drive", progress: 45, status: "Active", reach: "300k" },
];

export const MOCK_EPIDEMIC_ALERTS = [
  { id: "e1", disease: "Measles", location: "South District", risk: "High", action: "Emergency Vaccinations" },
  { id: "e2", disease: "Dengue", location: "East District", risk: "Medium", action: "Mosquito Fogging" },
];

export const MOCK_FACILITY_STOCKS = [
  { facility: "Central General", status: "Critical", lowItems: ["Paracetamol", "Oxygen Tanks"] },
  { facility: "District Hospital A", status: "Low", lowItems: ["Amoxicillin"] },
  { facility: "Rural Clinic B", status: "Normal", lowItems: [] },
  { facility: "St. Mary Clinic", status: "Critical", lowItems: ["Gloves", "Syringes", "ART Meds"] },
];
