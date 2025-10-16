import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';
import roles from '../middleware/roles.js';

const router = express.Router();

// Protected route for restaurant role only
router.get('/', auth, roles('restaurant'), getAnalytics);

export default router;
