import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
  getSchedule,
  updateScheduleConfig,
} from '../controllers/scheduleController.js';
import {
  getBlockouts,
  createBlockout,
  updateBlockout,
  deleteBlockout,
} from '../controllers/blockoutController.js';

const router = express.Router();


router.use(protect);
router.use(restrictTo('owner', 'superadmin'));


router.get('/schedule', getSchedule);
router.put('/schedule', updateScheduleConfig);


router.get('/blockouts', getBlockouts);
router.post('/blockouts', createBlockout);
router.put('/blockouts/:id', updateBlockout);
router.delete('/blockouts/:id', deleteBlockout);

export default router;