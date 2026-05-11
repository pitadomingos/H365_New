import express from 'express';
import syncRoutes from './sync/sync.routes.js';

const router = express.Router();

router.use('/sync', syncRoutes);

export default router;
