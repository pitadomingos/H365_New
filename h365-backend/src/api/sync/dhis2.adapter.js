/**
 * DHIS2 Adapter Utility
 * Maps internal data structures to DHIS2 DataValueSets
 */

import { DHIS2_MAPPINGS, getDhis2IdByCode } from './mapping-registry.js';
import { privacyAuditLog } from './privacy.utils.js';

/**
 * Aggregates clinical records into DHIS2 DataValueSets
 */
export const aggregateFacilityData = async (pool, facilityId, period) => {
  // Translate period YYYYMM to date range
  const year = period.substring(0, 4);
  const month = period.substring(4, 6);
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  console.log(`[Adapter] Aggregating from ${startDate} to ${endDate}`);

  // Query counts for different indicator types
  const query = `
    SELECT 
      collection as indicator,
      data->>'$.diagnosis_code' as diagnosis_code,
      COUNT(*) as value
    FROM clinical_records
    WHERE facility_id = ? 
      AND created_at BETWEEN ? AND ?
    GROUP BY collection, diagnosis_code
  `;

  const [rows] = await pool.execute(query, [facilityId, startDate, endDate]);

  const aggregatedValues = {};

  rows.forEach(row => {
    // 1. Try to find a mapping by diagnosis code
    const codeId = row.diagnosis_code ? getDhis2IdByCode(row.diagnosis_code) : null;
    
    // 2. Try to find a mapping by collection name
    const mapping = DHIS2_MAPPINGS[row.indicator];
    const collectionId = mapping ? mapping.dhis2Id : null;
    
    const finalId = codeId || collectionId;
    
    // STRICT SECURITY: Only include if we have a valid DHIS2 Data Element ID mapping
    if (finalId) {
      aggregatedValues[finalId] = (aggregatedValues[finalId] || 0) + parseInt(row.value);
    } else {
      console.warn(`[Security-Guard] Scrubbed unidentified indicator: ${row.indicator}`);
      // Record in Privacy Audit
      if (typeof privacyAuditLog !== 'undefined') {
        privacyAuditLog.push({
          id: Date.now() + Math.random(),
          type: 'SECURITY',
          message: `Blocked unidentified indicators (${row.indicator}) from DHIS2 export`,
          severity: 'medium',
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  const dataValues = Object.entries(aggregatedValues).map(([id, val]) => ({
    dataElement: id,
    value: val.toString()
  }));

  // Fetch the Organization Unit ID for this facility
  const orgUnitId = 'vI73fsv2'; 

  return {
    dataSet: 'p8df23v8s', // DHIS2 Data Set ID (e.g., PHC Monthly Dataset)
    orgUnit: orgUnitId,
    period: period,
    dataValues
  };
};
