/**
 * DHIS2 Interoperability Controller
 * Logic for aggregating local data and pushing to DHIS2.
 */

import { aggregateFacilityData } from './dhis2.adapter.js';

export const triggerDhis2Sync = async (req, res) => {
  const { period, facilityId } = req.body; // e.g., period: '202405'
  const pool = req.app.get('dbPool');

  if (!period) {
    return res.status(400).json({ error: 'Reporting period is required (YYYYMM)' });
  }

  console.log(`[DHIS2-Interop] Starting aggregation for Facility: ${facilityId} Period: ${period}`);

  try {
    // 1. Fetch and Aggregate
    const dataValueSet = await aggregateFacilityData(pool, facilityId, period);

    if (!dataValueSet.dataValues.length) {
      return res.status(200).json({ message: 'No records found for this period to report' });
    }

    // 2. Push to DHIS2
    const dhis2Url = process.env.DHIS2_BASE_URL || 'https://play.dhis2.org/2.40/api';
    const response = await fetch(`${dhis2Url}/dataValueSets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.DHIS2_USER}:${process.env.DHIS2_PASS}`).toString('base64')}`
      },
      body: JSON.stringify(dataValueSet)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[DHIS2-Interop] Successfully reported to DHIS2. Import summary:`, result.importCount);
      return res.status(200).json({ 
        message: 'DHIS2 Reporting Successful', 
        summary: result.importCount 
      });
    } else {
      console.error('[DHIS2-Interop] DHIS2 API Rejected request:', result);
      return res.status(response.status).json({ 
        error: 'DHIS2 rejection', 
        details: result 
      });
    }

  } catch (error) {
    console.error('[DHIS2-Interop] Fatal error during DHIS2 sync:', error);
    return res.status(500).json({ error: 'Internal server error during DHIS2 processing' });
  }
};
