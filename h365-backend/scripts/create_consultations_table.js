import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function createConsultationsTable() {
  let pool;
  try {
    pool = await initializeDatabase();
    console.log("Creating 'consultations' table...");

    const createTableQuery = `
      CREATE TABLE consultations (
          consultation_id INT PRIMARY KEY AUTO_INCREMENT,
          patient_id VARCHAR(255) NOT NULL,
          doctor_id VARCHAR(255) NOT NULL,
          consultation_date DATETIME NOT NULL,
          department VARCHAR(255),
          body_temperature_celsius DECIMAL(5, 2),
          weight_kg DECIMAL(6, 2),
          height_cm DECIMAL(6, 2),
          bmi DECIMAL(5, 2),
          blood_pressure VARCHAR(20),
          bp_status VARCHAR(50),
          symptoms TEXT,
          diagnosis TEXT,
          prescription TEXT,
          ai_diagnosis TEXT,
          ai_prescription TEXT,
          ai_recommendations TEXT,
          doctor_notes TEXT,
          outcome VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(national_id),
          FOREIGN KEY (doctor_id) REFERENCES personnel(personnel_id)
      );
    `;

    await pool.query(createTableQuery);
    console.log("Table 'consultations' created successfully.");

  } catch (error) {
    console.error("Error creating 'consultations' table:", error);
    process.exit(1); // Exit with error
  } finally {
    if (pool) {
      pool.end();
    }
  }
}

createConsultationsTable();