import applicationRoutes from './application.route';

import { Router } from 'express';
const router = Router();

router.use('/applications', applicationRoutes);

export default router;
