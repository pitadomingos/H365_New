import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function alterPersonnelTable() {
    let pool;
    try {
        pool = await initializeDatabase();
        console.log("Altering 'personnel' table...");

        const alterTableQueries = [
            `ALTER TABLE personnel ADD COLUMN role_id INT NULL;`,
            `ALTER TABLE personnel ADD COLUMN facility_id INT NULL;`,
            `ALTER TABLE personnel ADD CONSTRAINT fk_personnel_role FOREIGN KEY (role_id) REFERENCES roles(role_id);`,
            `ALTER TABLE personnel ADD CONSTRAINT fk_personnel_facility FOREIGN KEY (facility_id) REFERENCES facilities(facility_id);`
        ];

        for (const query of alterTableQueries) {
            await pool.query(query);
            console.log(`Executed: ${query}`);
        }

        console.log("'personnel' table altered successfully.");

    } catch (error) {
        console.error("Error altering 'personnel' table:", error);
        process.exit(1); // Exit with error
    } finally {
        if (pool) {
            pool.end();
        }
    }
}

alterPersonnelTable();