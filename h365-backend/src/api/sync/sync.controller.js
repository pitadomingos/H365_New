/**
 * Synchronisation Controller
 * Handles incoming data batches from workstations on the LAN.
 */

export const processSyncBatch = async (req, res) => {
  const { workstationId, facilityId, batch } = req.body;
  const pool = req.app.get('dbPool');

  if (!batch || !Array.isArray(batch)) {
    return res.status(400).json({ error: 'Invalid batch format' });
  }

  console.log(`[SyncService] Receiving batch of ${batch.length} from Workstation: ${workstationId}`);

  try {
    const results = [];
    
    // Process each item in the batch
    for (const item of batch) {
      const { collection, payload, timestamp, localId } = item;
      
      // In a real production system, we would map the 'collection' to specific MySQL tables.
      // For this implementation, we demonstrate the upsert logic.
      
      // Example implementation for generic data persistence:
      // This ensures that even if we don't have a specific table, the data is captured in a raw log.
      const query = `
        INSERT INTO clinical_records (local_id, collection, data, created_at, facility_id, workstation_id)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        data = VALUES(data),
        updated_at = CURRENT_TIMESTAMP
      `;

      try {
        await pool.execute(query, [
          localId || item.id, 
          collection, 
          JSON.stringify(payload), 
          new Date(timestamp).toISOString().slice(0, 19).replace('T', ' '),
          facilityId || 'FAC-001',
          workstationId || 'WS-LOCAL'
        ]);
        results.push({ id: item.id, status: 'success' });
      } catch (err) {
        console.error(`[SyncService] Failed to process item ${item.id}:`, err);
        results.push({ id: item.id, status: 'error', message: err.message });
      }
    }

    return res.status(200).json({ 
      message: 'Batch processing complete', 
      processed: batch.length,
      results 
    });
  } catch (error) {
    console.error('[SyncService] Batch processing internal error:', error);
    return res.status(500).json({ error: 'Internal server error during sync' });
  }
};
