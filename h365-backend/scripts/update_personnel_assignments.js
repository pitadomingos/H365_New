import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function updatePersonnelAssignments() {
    let pool;
    try {
        pool = await initializeDatabase();
        console.log("Updating personnel assignments...");

        // Fetch all personnel_ids
        const [personnelRows] = await pool.query('SELECT personnel_id FROM personnel');
        const personnelIds = personnelRows.map(row => row.personnel_id);

        // Define available role_ids and facility_ids
        // You should replace these with actual IDs from your roles and facilities tables
        const availableRoleIds = [1, 2, 3, 4, 5];
        const availableFacilityIds = [6, 7]; // Assuming these are your hospital facility IDs

        for (const personnelId of personnelIds) {
            // Randomly select a role_id and facility_id
            const randomRoleId = availableRoleIds[Math.floor(Math.random() * availableRoleIds.length)];
            const randomFacilityId = availableFacilityIds[Math.floor(Math.random() * availableFacilityIds.length)];

            // Update personnel record
            const updateQuery = `
                UPDATE personnel
                SET role_id = ?, facility_id = ?
                WHERE personnel_id = ?
            `;
            const updateValues = [randomRoleId, randomFacilityId, personnelId];

            await pool.query(updateQuery, updateValues);
            console.log(`Updated assignments for personnel ID ${personnelId} with role_id ${randomRoleId} and facility_id ${randomFacilityId}`);
        }

        console.log("Personnel assignments updated successfully.");

    } catch (error) {
        console.error("Error updating personnel assignments:", error);
        process.exit(1); // Exit with error
    } finally {
        if (pool) {
            pool.end();
        }
    }
}

updatePersonnelAssignments();