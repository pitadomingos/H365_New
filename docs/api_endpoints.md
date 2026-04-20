
# H365: Proposed API Endpoints (Revised)

This document outlines the proposed API endpoints for the H365 application based on the developed frontend features.

## I. General / Authentication

*   **`POST /api/v1/auth/login`**
    *   Purpose: User login.
    *   Request: `{ username, password }`
    *   Response: `{ token, user: { id, fullName, role, permissions } }`
*   **`POST /api/v1/auth/logout`**
    *   Purpose: User logout.
*   **`GET /api/v1/auth/me`**
    *   Purpose: Get current logged-in user details.
    *   Response: `{ id, fullName, role, permissions, hospitalId?, districtId?, provinceId? }`

## II. Dashboard (`/`)

*   **`GET /api/v1/dashboard/summary-cards`**
    *   Purpose: Fetch data for all summary cards (appointments, ward occupancy, ER status, new patients, total patients, common condition, top prescriptions).
    *   Response: Object or array containing data for each card, e.g., `{ appointmentsToday: 12, wardOccupancy: 75, erStatus: "12 Active", topPrescriptions: ["DrugA", "DrugB", ...] }`
*   **`GET /api/v1/dashboard/patient-entry-points`**
    *   Purpose: Data for patient entry points pie chart.
    *   Response: `[{ name: "Outpatient", value: 400 }, { name: "Emergency", value: 150 }, ...]`
*   **`GET /api/v1/dashboard/daily-attendance`**
    *   Purpose: Data for daily patient attendance bar chart (last 7 days).
    *   Response: `[{ day: "Mon", patients: 120 }, { day: "Tue", patients: 150 }, ...]`
*   **`GET /api/v1/dashboard/recent-activity`**
    *   Purpose: Fetch recent activity feed items for the current user/hospital.
    *   Response: `[{ user: "Dr. Smith", action: "updated chart", time: "2 min ago" }, ...]`
*   **`GET /api/v1/dashboard/drafted-consultations`**
    *   Purpose: Fetch list of drafted/pending consultations for the current user.
    *   Response: `[{ id: "draft1", patientName: "John Doe", specialtyOrReason: "Cardiology - Awaiting Labs", lastSavedTime: "2h ago" }, ...]`

## III. Patient Registration (`/patient-registration`)

*   **`POST /api/v1/patients`**
    *   Purpose: Register a new patient (individual registration).
    *   Request Body: `{ nationalId, fullName, dateOfBirth, gender, contactNumber, email?, address, district, province, homeHospital?, nextOfKinName?, nextOfKinNumber?, nextOfKinAddress?, allergies?, chronicConditions?, photoDataUri? }` (photoDataUri is mandatory for this specific form).
    *   Success Response (201 Created): `{ message: "Patient registered", patient: { id, nationalId, fullName, age, gender, chronicConditions, ... } }`
*   **`GET /api/v1/patients/search?nationalId={nationalId}`**
    *   Purpose: Search for a patient by National ID.
    *   Success Response (200 OK): Patient object including `chronicConditions`.
    *   Not Found Response (404): `{ error: "Patient not found" }`
*   **`POST /api/v1/patients/bulk`**
    *   Purpose: Register multiple patients from a CSV/Excel file.
    *   Request: Multipart form data with the file. (CSV headers should include `ChronicConditions`).
    *   Response: `{ message: "Bulk registration processing started.", results: { successful: number, failed: number, errors?: any[] } }`

## IV. Visiting Patients (Consultation Intake) (`/visiting-patients`)

*   **`POST /api/v1/visits`**
    *   Purpose: Record a new patient visit and add to the hospital-wide waiting list.
    *   Request Body: `{ patientId, department, reasonForVisit, assignedDoctor?, visitDate }`
    *   Success Response (201 Created): Created visit object, possibly including waiting list position.
*   **`GET /api/v1/visits/waiting-list`**
    *   Purpose: Get the current hospital-wide waiting list (can be filtered by department query param).
    *   Response: `[{ id, patientName, photoUrl, gender, timeAdded, location, status }, ...]`
*   **`GET /api/v1/visits/stats`**
    *   Purpose: Fetch statistics for the visiting patients module (chart data, avg wait time, total processed, peak hour).
    *   Response: `{ chartData: [...], summaryStats: { avgWaitTime, totalProcessed, peakHour } }`

## V. Appointments (`/appointments`)

*   **`GET /api/v1/appointments`**
    *   Purpose: Get list of appointments (filterable by date, doctorId, patientId, status).
    *   Response: `[{ id, patientName, doctorName, date, time, type, status }, ...]`
*   **`POST /api/v1/appointments`**
    *   Purpose: Schedule a new appointment.
    *   Request Body: `{ patientName, doctorId, date, time, type }`
    *   Success Response (201 Created): Created appointment object.
*   **`GET /api/v1/doctors`**
    *   Purpose: List of doctors for scheduling.
    *   Response: `[{ id, name }, ...]`
*   **`GET /api/v1/notifications?context=appointments`** (or `/api/v1/appointments/notifications`)
    *   Purpose: Appointment-related notifications.
    *   Response: `[{ id, message, time, read }, ...]`

## VI. Consultation Room (`/treatment-recommendation`) & Specializations (`/specializations`)

*   **`POST /api/v1/consultations`**
    *   Purpose: Finalize and save a completed consultation (general or specialist).
    *   Request Body (Comprehensive): `{ patientId, consultationDate, consultingDoctorId, department/specialty, referringDoctorId?, reasonForReferral?, vitals: { temp, weight, height, bmi, bloodPressure }, symptoms (comprehensive), labResultsSummaryInput?, imagingDataSummaryInput?, aiDiagnosis?, aiPrescription?, aiRecommendations?, doctorNotes/specialistComments, finalDiagnosis, prescription, outcome, ...outcomeSpecificDetails }`
    *   Success Response (201 Created): `{ message: "Consultation saved", consultationId }`
*   **`POST /api/v1/consultations/drafts`** (or `PUT /api/v1/consultations/drafts/{draftId}`)
    *   Purpose: Save/update consultation draft.
    *   Request Body: Similar to above, fields are optional.
    *   Success Response (200 OK / 201 Created): `{ message: "Draft saved", draftId }`
*   **`POST /api/v1/consultations/{consultationId}/lab-orders`**
    *   Purpose: Submit lab orders for a consultation.
    *   Request Body: `{ testIds: string[], clinicalNotes: string }`
    *   Success Response (201 Created): `{ message: "Lab order submitted", labOrderId }`
*   **`POST /api/v1/consultations/{consultationId}/imaging-orders`**
    *   Purpose: Submit imaging orders for a consultation.
    *   Request Body: `{ imagingType: string, regionDetails: string, clinicalNotes: string }`
    *   Success Response (201 Created): `{ message: "Imaging order submitted", imagingOrderId }`
*   `GET /api/v1/consultations/drafts?doctorId={id}` (or `?specialistId={id}`) - For fetching drafts for the left panel.
*   `GET /api/v1/referrals?specialty={specialty}` (For Specializations page left panel)
    *   Purpose: Get list of patients referred to the current specialist/department.
    *   Response: `[{ id, patientName, referringDoctor, reason, timeReferred, specialty, photoUrl, gender }, ...]`

## VII. Maternity Care (`/maternity-care`)

*   **`POST /api/v1/maternity/patients`**
    *   Purpose: Register/Initiate maternity care for a patient.
    *   Request Body: `{ nationalId, fullName, dob, gender, lmp, edd?, gravida, para, bloodGroup?, rhFactor?, allergies?, chronicConditions? }`
    *   Success Response (201 Created): Created/updated maternity patient profile.
*   **`GET /api/v1/maternity/patients/search?nationalId={nationalId}`** (Or reuse `/api/v1/patients/search` and then check if maternity profile exists)
    *   Purpose: Search for a maternity patient.
    *   Response: Maternity patient object including `chronicConditions`.
*   **`POST /api/v1/maternity/patients/{patientId}/antenatal-visits`**
    *   Purpose: Log a new antenatal visit.
    *   Request Body: `{ visitDate, gestationalAge, weightKg, bp, fhrBpm, fundalHeightCm, notes, nextAppointmentDate?, bodyTemperature?, heightCm?, bmi?, bmiStatus?, bpStatus? }`
    *   Success Response (201 Created): Created antenatal visit object.
    *   *(Lab/Imaging orders can use the general consultation order endpoints by treating the antenatal visit as a type of consultation, or have dedicated maternity order endpoints if distinct logic is needed)*.

## VIII. Ward Management (`/ward-management`)

*   **`GET /api/v1/wards`**
    *   Purpose: List of all wards (summary for dropdown: id, name).
*   **`GET /api/v1/wards/{wardId}/details`**
    *   Purpose: Detailed info for a specific ward (stats, current patient list, bed status).
    *   Response: `{ id, name, totalBeds, occupiedBeds, ..., patients: [{ admissionId, patientId, name, bedNumber, admittedDate, primaryDiagnosis, keyAlerts[] }], beds: [{ id, bedNumber, status, patientName?, patientId? }] }`
*   **`GET /api/v1/admissions/pending`**
    *   Purpose: List of patients pending hospital admission from other departments.
    *   Response: `[{ id, patientId, patientName, referringDepartment, reasonForAdmission }, ...]`
*   **`POST /api/v1/admissions`**
    *   Purpose: Admit a patient to a ward.
    *   Request Body: `{ patientId, wardId, bedId, admittingDoctor, primaryDiagnosis, admissionDate }`
    *   Success Response (201 Created): Created admission object.
*   **`GET /api/v1/admissions/{admissionId}`**
    *   Purpose: Full care details of an admitted patient.
    *   Response: `{ admissionId, patientId, name, ..., vitals: {...}, chronicConditions: string[], treatmentPlan, medicationSchedule: [...], doctorNotes: [...], visitHistory: [...] }`
*   **`PUT /api/v1/admissions/{admissionId}/vitals`**
    *   Purpose: Update vitals for an admitted patient.
    *   Request Body: `{ bodyTemperature?, weightKg?, heightCm?, bloodPressure? }` (includes calculated BMI/BP status on backend).
*   **`POST /api/v1/admissions/{admissionId}/doctor-notes`**
    *   Purpose: Add a doctor's note.
    *   Request Body: `{ doctorId, note }`
    *   Response: Created note object.
*   **`PUT /api/v1/admissions/{admissionId}/medication-schedule`**
    *   Purpose: Update the entire medication schedule (add, edit, update status).
    *   Request Body: `{ updatedSchedule: MedicationScheduleItem[] }` (where `MedicationScheduleItem` includes `medicationItemId` or is new, `medication`, `dosage`, `time`, `status`, `notes`).
*   **`PUT /api/v1/admissions/{admissionId}/discharge`**
    *   Request Body: `{ dischargeDate, dischargeSummary, dischargedBy }`
*   **`PUT /api/v1/admissions/{admissionId}/transfer`**
    *   Request Body: `{ transferDate, transferType, destinationWardId?, destinationFacility?, transferReason, transferredBy }`

## IX. Laboratory Management (`/laboratory-management`)

*   **`GET /api/v1/lab/requests`**
    *   Purpose: List lab requests (filterable).
    *   Response: `[{ id, patientName, nationalId, testsRequested: string[], orderingDoctor, requestDate, status, results?: ResultInputItem[] | string }, ...]`
*   **`POST /api/v1/lab/requests/{requestId}/results`**
    *   Purpose: Enter lab results.
    *   Request Body: `{ results: ResultInputItem[], labTechnicianComments: string }`
    *   *Backend Implication*: This should trigger simulated reagent consumption.
*   **`GET /api/v1/lab/reagents`**
    *   Purpose: Get reagent inventory.
    *   Response: `[{ id, name, currentStock, threshold, unit }, ...]`
*   **`POST /api/v1/lab/reagents/requisitions`**
    *   Purpose: Request reagent replenishment (hierarchical).
    *   Request Body: `{ requestingLabId, items: [{ reagentId, reagentName, requestedQuantity, currentStockAtLab }], notes }`
    *   Response: `{ message, requisitionId }`
*   **`GET /api/v1/lab/reagents/requisitions/log`**
    *   Purpose: Fetch reagent requisition history.
    *   Response: `[{ id, requestedItemsSummary, dateSubmitted, submittedBy, status }, ...]`
*   **`GET /api/v1/lab/reports/summary`** (or similar to dashboard's daily summary)
    *   Purpose: Fetch daily lab summary.
*   **`POST /api/v1/equipment/malfunctions`** (Shared endpoint)
    *   Purpose: Report lab equipment malfunction.
    *   Request Body: `{ assetNumber, instrumentName, problemDescription, reportedBy, reportDateTime, department: "Laboratory" }`

## X. Imaging & Radiology Management (`/imaging-management`)

*   **`GET /api/v1/imaging/requests`**
    *   Purpose: List imaging requests (filterable).
    *   Response: `[{ id, patientName, nationalId, studyRequested, orderingDoctor, requestDate, status, reportDetails?: { reportContent, impression } }, ...]`
*   **`POST /api/v1/imaging/requests/{requestId}/report`**
    *   Purpose: Enter imaging report.
    *   Request Body: `{ reportContent, impression }`
*   **`GET /api/v1/imaging/reports/summary`** (or similar to dashboard's daily summary)
    *   Purpose: Fetch daily imaging summary.
*   **`POST /api/v1/equipment/malfunctions`** (Shared endpoint)
    *   Purpose: Report imaging equipment malfunction.
    *   Request Body: `{ assetNumber, instrumentName, problemDescription, reportedBy, reportDateTime, department: "Imaging/Radiology" }`

## XI. Drug Dispensing Pharmacy (`/pharmacy-locator`)

*   **`GET /api/v1/pharmacy/prescriptions?status=pending`**
    *   Response: `[{ id, patientName, medication, quantity, doctor, status }, ...]`
*   **`PUT /api/v1/pharmacy/prescriptions/{prescriptionId}/dispense`**
    *   Request Body: `{ dispensedQuantity, pharmacistId }`
    *   *Backend Implication*: Deduct from local pharmacy inventory.
*   **`GET /api/v1/pharmacy/inventory`**
    *   Response: `[{ id, name, currentStock, threshold, unit }, ...]`
*   **`POST /api/v1/pharmacy/requisitions`**
    *   Purpose: Request medication replenishment (hierarchical).
    *   Request Body: `{ requestingFacilityId, items: [{ itemId, itemName, requestedQuantity, currentStockAtFacility }], notes }`
    *   Response: `{ message, requisitionId }`
*   **`GET /api/v1/pharmacy/requisitions/log`**
    *   Purpose: Fetch pharmacy requisition history.
    *   Response: `[{ id, requestedItemsSummary, dateSubmitted, submittedBy, status }, ...]`
*   **`GET /api/v1/pharmacy/reports/summary`** (or similar to dashboard's daily summary)
    *   Purpose: Fetch daily dispensing summary.

---

This revised list aims to be comprehensive based on our frontend development. Each endpoint implies necessary backend logic for data validation, database interaction (with your MySQL database on Aiven), business rule enforcement, and appropriate responses.
Let me know if this looks good, or if there are any immediate adjustments you'd like to make before we potentially dive into the first set of backend tasks!
