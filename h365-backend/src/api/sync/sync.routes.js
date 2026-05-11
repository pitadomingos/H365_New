import express from 'express';
import { processSyncBatch } from './sync.controller.js';
import { triggerDhis2Sync } from './dhis2.controller.js';

const router = express.Router();

// Synchronize a batch of clinical data from a workstation
router.post('/batch', processSyncBatch);

// Export aggregate data to National DHIS2 instance
router.post('/dhis2-push', triggerDhis2Sync);

export default router;
