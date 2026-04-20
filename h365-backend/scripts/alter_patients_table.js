import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function alterPatientsTable() {
  let pool;
  try {
    pool = await initializeDatabase();

    const alterTableQueries = [
      `ALTER TABLE patients ADD COLUMN full_name VARCHAR(255) NOT NULL AFTER national_id;`,
      `ALTER TABLE patients ADD COLUMN age INT AFTER full_name;`,
      `ALTER TABLE patients ADD COLUMN country VARCHAR(255) AFTER address;`,
      `ALTER TABLE patients ADD COLUMN home_clinic_id INT NULL AFTER country;`,
      `ALTER TABLE patients ADD COLUMN photo_url VARCHAR(255) AFTER home_clinic_id;`,
      `ALTER TABLE patients ADD COLUMN allergies TEXT AFTER photo_url;`,
      `ALTER TABLE patients ADD COLUMN chronic_conditions TEXT AFTER allergies;`
    ];

    console.log("Adding columns to 'patients' table...");
    for (const query of alterTableQueries) {
      await pool.query(query);
    }
    console.log("Columns added successfully.");

    const addForeignKeyQuery = `
      ALTER TABLE patients
      ADD CONSTRAINT fk_patients_home_clinic
      FOREIGN KEY (home_clinic_id) REFERENCES facilities(facility_id);
    `;

    console.log("Adding foreign key constraint to 'patients' table...");
    await pool.query(addForeignKeyQuery);
    console.log("Foreign key constraint added successfully.");

  } catch (error) {
    console.error("Error altering 'patients' table:", error);
    process.exit(1); // Exit with error
  } finally {
    if (pool) {
      pool.end();
    }
  }
}

alterPatientsTable();