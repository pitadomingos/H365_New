import 'dotenv/config';
import { initializeDatabase } from '../src/config/database.config.js';

async function insertFacilities() {
    let pool;
    try {
        pool = await initializeDatabase();

        const facilities = [
            { facility_name: 'National Health Ministry', facility_type: 'National', country: 'Country X', parent_facility_id: null, province: null, district: null, address: 'Capital City' },
            { facility_name: 'Province A Health Department', facility_type: 'Province', country: 'Country X', parent_facility_id: null, province: 'Province A', district: null, address: 'Province A Capital' },
            { facility_name: 'Province B Health Department', facility_type: 'Province', country: 'Country X', parent_facility_id: null, province: 'Province B', district: null, address: 'Province B Capital' },
            { facility_name: 'District 1 Health Office', facility_type: 'District', country: 'Country X', parent_facility_id: null, province: 'Province A', district: 'District 1', address: 'District 1 Town' },
            { facility_name: 'District 2 Health Office', facility_type: 'District', country: 'Country X', parent_facility_id: null, province: 'Province A', district: 'District 2', address: 'District 2 Town' },
            { facility_name: 'General Hospital A1', facility_type: 'Hospital', country: 'Country X', parent_facility_id: null, province: 'Province A', district: 'District 1', address: 'Hospital A1 Address' },
            { facility_name: 'Community Clinic A2', facility_type: 'Clinic', country: 'Country X', parent_facility_id: null, province: 'Province A', district: 'District 1', address: 'Clinic A2 Address' },
            { facility_name: 'General Hospital B1', facility_type: 'Hospital', country: 'Country X', parent_facility_id: null, province: 'Province B', district: null, address: 'Hospital B1 Address' },
        ];

        console.log("Inserting facilities into the 'facilities' table...");

        // Fetch existing facilities to determine parent_facility_ids
        const [existingFacilities] = await pool.query('SELECT facility_id, facility_name FROM facilities');
        const facilityMap = existingFacilities.reduce((map, facility) => {
            map[facility.facility_name] = facility.facility_id;
            return map;
        }, {});

        const insertQueries = facilities.map(facility => {
            let parentId = null;
            // Manually set parent_facility_id based on facility name relationships
            if (facility.facility_name === 'Province A Health Department') {
                 parentId = facilityMap['National Health Ministry'];
            } else if (facility.facility_name === 'Province B Health Department') {
                 parentId = facilityMap['National Health Ministry'];
            } else if (facility.facility_name === 'District 1 Health Office') {
                 parentId = facilityMap['Province A Health Department'];
            } else if (facility.facility_name === 'District 2 Health Office') {
                 parentId = facilityMap['Province A Health Department'];
            } else if (facility.facility_name === 'General Hospital A1') {
                 parentId = facilityMap['District 1 Health Office'];
            } else if (facility.facility_name === 'Community Clinic A2') {
                 parentId = facilityMap['District 1 Health Office'];
            } else if (facility.facility_name === 'General Hospital B1') {
                 parentId = facilityMap['Province B Health Department']; // Or a district in Province B if you add one
            }


            const query = `
                INSERT INTO facilities (facility_name, facility_type, parent_facility_id, country, province, district, address)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                facility.facility_name,
                facility.facility_type,
                parentId, // Use the resolved parentId
                facility.country,
                facility.province,
                facility.district,
                facility.address
            ];
            return pool.query(query, values);
        });

        await Promise.all(insertQueries);

        console.log("Test facilities inserted successfully.");

    } catch (error) {
        console.error("Error inserting facilities:", error);
        process.exit(1);
    } finally {
        if (pool) {
            pool.end();
        }
    }
}

insertFacilities();