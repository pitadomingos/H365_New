/**
 * Upstream Sync Script (BluePrint)
 * 
 * This script is intended to be run as a cron job on the LAN server.
 * It pushes facility-aggregated data to the National Central SaaS Platform.
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

import { isSafeForUpstream, scrubPii } from '../api/sync/privacy.utils.js';

async function syncToUpstream() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('[UpstreamSync] Starting scheduled push to Central SaaS...');

  try {
    // 1. Fetch records that haven't been synced to the cloud yet
    const [rows] = await pool.execute(
      "SELECT * FROM clinical_records WHERE sync_status = 'pending' LIMIT 100"
    );

    if (rows.length === 0) {
      console.log('[UpstreamSync] No pending records. Sleeping.');
      return;
    }

    // 2. Prepare Safe Batch (Scrub PII)
    const safeRecords = rows.map(record => {
      const rawData = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
      return {
        ...record,
        data: JSON.stringify(scrubPii(rawData))
      };
    });

    console.log(`[UpstreamSync] Pushing ${safeRecords.length} scrubbed records to ${process.env.CENTRAL_SAAS_API_URL}`);

    // 3. Perform the cloud push
    const response = await fetch(`${process.env.CENTRAL_SAAS_API_URL}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CENTRAL_SAAS_API_KEY}`
      },
      body: JSON.stringify({
        facilityId: process.env.FACILITY_ID || 'FAC-001',
        records: safeRecords
      })
    });

    if (response.ok) {
      // 3. Mark as synced on success
      const ids = rows.map(r => r.id);
      const placeholders = ids.map(() => '?').join(',');
      await pool.execute(
        `UPDATE clinical_records SET sync_status = 'synced', synced_at = NOW() WHERE id IN (${placeholders})`,
        ids
      );
      console.log('[UpstreamSync] Successfully synced batch.');
    } else {
      console.error('[UpstreamSync] Cloud API rejected batch:', await response.text());
    }

  } catch (error) {
    console.error('[UpstreamSync] Error during upstream synchronization:', error);
  } finally {
    await pool.end();
  }
}

// In a real environment, you'd trigger this via cron.
// Example: */15 * * * * node upstream-sync.js
syncToUpstream();
