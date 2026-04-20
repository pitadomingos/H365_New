import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function insertRoles() {
  let pool;
  try {
    pool = await initializeDatabase();

    const rolesToInsert = [
      { role_name: 'National Admin', description: 'Administrator with national-level access.' },
      { role_name: 'Province Lead', description: 'Manager with province-level access.' },
      { role_name: 'District Manager', description: 'Manager with district-level access.' },
      { role_name: 'Hospital Clinician', description: 'Clinician with hospital-level access.' },
      { role_name: 'Receptionist', description: 'Staff with reception duties.' },
    ];

    console.log("Inserting roles into the 'roles' table...");

    const insertPromises = rolesToInsert.map(role => {
      const query = 'INSERT INTO roles (role_name, description) VALUES (?, ?)';
      return pool.query(query, [role.role_name, role.description]);
    });

    await Promise.all(insertPromises);

    console.log("Test roles inserted successfully.");

  } catch (error) {
    console.error("Error inserting test roles:", error);
    process.exit(1); // Exit with error
  } finally {
    if (pool) {
      pool.end();
    }
  }
}

insertRoles();