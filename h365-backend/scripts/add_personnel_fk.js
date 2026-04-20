import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function addPersonnelForeignKeys() {
    let pool;
    try {
        pool = await initializeDatabase();
        console.log("Adding foreign key constraints to 'personnel' table...");

        const addFkQueries = [
            `
            ALTER TABLE personnel
            ADD CONSTRAINT fk_personnel_role
            FOREIGN KEY (role_id) REFERENCES roles(role_id);
            `,
            `
            ALTER TABLE personnel
            ADD CONSTRAINT fk_personnel_facility
            FOREIGN KEY (facility_id) REFERENCES facilities(facility_id);
            `
        ];

        for (const query of addFkQueries) {
            await pool.query(query);
        }

        console.log("Foreign key constraints added successfully to 'personnel' table.");

    } catch (error) {
        console.error("Error adding foreign key constraints to 'personnel' table:", error);
        process.exit(1); // Exit with error
    } finally {
        if (pool) {
            pool.end();
        }
    }
}

addPersonnelForeignKeys();