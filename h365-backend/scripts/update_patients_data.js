import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function updatePatientsData() {
    let pool;
    try {
        pool = await initializeDatabase();
        console.log("Updating patients data...");

        const facilityIds = [6, 7]; // Example facility IDs from your test data (Hospitals)

        for (let i = 1; i <= 20; i++) {
            const nationalId = 'PATIENT_NID_' + i;

            // Fetch first_name and last_name
            const [rows] = await pool.query('SELECT first_name, last_name FROM patients WHERE national_id = ?', [nationalId]);
            if (rows.length === 0) {
                console.warn(`Patient with National ID ${nationalId} not found.`); // This line already uses nationalId
                continue;
            }
            const { first_name, last_name } = rows[0];
            const full_name = `${first_name} ${last_name}`;

            // Generate sample data
            const age = Math.floor(Math.random() * 80) + 1; // Random age between 1 and 80
            const country = 'Country X'; // Using the same country as facilities
            const home_clinic_id = facilityIds[Math.floor(Math.random() * facilityIds.length)]; // Randomly assign to one of the hospital facilities
            const photo_url = `/photos/patient_${i}.jpg`; // Sample photo URL
            const allergies = `Allergy ${i % 5}`; // Sample allergy 
            const chronic_conditions = `Condition ${i % 3}`; // Sample chronic condition

            // Update patient record
            const updateQuery = `
                UPDATE patients
                SET full_name = ?, age = ?, country = ?, home_clinic_id = ?, photo_url = ?, allergies = ?, chronic_conditions = ?
                WHERE national_id = ?
            `;
            const updateValues = [full_name, age, country, home_clinic_id, photo_url, allergies, chronic_conditions, nationalId];

            await pool.query(updateQuery, updateValues);
            console.log(`Updated data for patient with National ID ${nationalId}`);
        }

        console.log("Patients data updated successfully.");

    } catch (error) {
        console.error("Error updating patients data:", error);
        process.exit(1); // Exit with error
    } finally {
        if (pool) {
            pool.end();
        }
    }
}

updatePatientsData();