import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';
import { faker } from '@faker-js/faker'; // We'll use faker to generate realistic data

async function insertConsultations() {
    let pool;
    try {
        pool = await initializeDatabase();
        console.log("Inserting consultations into the 'consultations' table...");

        // Fetch patient national_ids
        const [patients] = await pool.query('SELECT national_id FROM patients');
        const patientNationalIds = patients.map(p => p.national_id);
        if (patientNationalIds.length === 0) {
            console.error("No patients found. Cannot insert consultations.");
            return;
        }

        // Fetch personnel_ids (doctors) - Assuming all personnel can be doctors for test data
        const [personnel] = await pool.query('SELECT personnel_id FROM personnel');
        const personnelIds = personnel.map(p => p.personnel_id);
        if (personnelIds.length === 0) {
            console.error("No personnel found. Cannot insert consultations.");
            return;
        }

        const numberOfConsultationsToGenerate = 50; // You can adjust this number

        const consultations = [];
        for (let i = 0; i < numberOfConsultationsToGenerate; i++) {
            const randomPatientNationalId = faker.helpers.arrayElement(patientNationalIds);
            const randomDoctorId = faker.helpers.arrayElement(personnelIds);
            const consultationDate = faker.date.recent({ days: 30 }); // Consultations in the last 30 days
            const department = faker.commerce.department();

            // Generate realistic vital signs
            const bodyTemperatureCelsius = faker.number.float({ min: 36, max: 38, precision: 0.1 });
            const weightKg = faker.number.float({ min: 40, max: 100, precision: 0.1 });
            const heightCm = faker.number.float({ min: 150, max: 190, precision: 0.1 });
            const bmi = weightKg / ((heightCm / 100) ** 2); // Calculate BMI
            const bloodPressure = `${faker.number.int({ min: 90, max: 140 })}/${faker.number.int({ min: 60, max: 90 })}`;
            const bpStatus = faker.helpers.arrayElement(['Normal', 'Elevated', 'Hypertension Stage 1', 'Hypertension Stage 2']); // Sample BP statuses

            const symptoms = faker.lorem.paragraph();
            const diagnosis = faker.lorem.sentence();
            const prescription = faker.lorem.sentence();
            const aiDiagnosis = faker.lorem.sentence();
            const aiPrescription = faker.lorem.sentence();
            const aiRecommendations = faker.lorem.sentence();
            const doctorNotes = faker.lorem.paragraph();
            const outcome = faker.helpers.arrayElement(['Resolved', 'Under Treatment', 'Referred', 'Closed']);

            consultations.push([
                randomPatientNationalId,
                randomDoctorId,
                consultationDate,
                department,
                bodyTemperatureCelsius,
                weightKg,
                heightCm,
                bmi,
                bloodPressure,
                bpStatus,
                symptoms,
                diagnosis,
                prescription,
                aiDiagnosis,
                aiPrescription,
                aiRecommendations,
                doctorNotes,
                outcome,
            ]);
        }

        // SQL query to insert multiple rows
        const insertQuery = `
            INSERT INTO consultations (
                patient_id, doctor_id, consultation_date, department,
                body_temperature_celsius, weight_kg, height_cm, bmi,
                blood_pressure, bp_status, symptoms, diagnosis,
                prescription, ai_diagnosis, ai_prescription, ai_recommendations,
                doctor_notes, outcome
            ) VALUES ?
        `;

        // Using pool.query with the values array and multipleStatements: true if needed, but '?' handles multiple rows
        await pool.query(insertQuery, [consultations]);

        console.log(`${numberOfConsultationsToGenerate} test consultations inserted successfully.`);

    } catch (error) {
        console.error("Error inserting consultations:", error);
        process.exit(1); // Exit with error
    } finally {
        if (pool) {
            pool.end();
        }
    }
}

insertConsultations();
