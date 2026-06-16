const { Router } = require('express');
const {
  getAllClubs, createClub, updateClub, deleteClub,
  approveClub, rejectClub, suspendClub,
} = require('../controllers/clubController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const router = Router();
const guard = [authMiddleware, roleMiddleware(['superadmin'])];

router.get('/',              ...guard, getAllClubs);
router.post('/',             ...guard, createClub);
router.put('/:id',           ...guard, updateClub);
router.delete('/:id',        ...guard, deleteClub);
router.patch('/:id/approve', ...guard, approveClub);
router.patch('/:id/reject',  ...guard, rejectClub);
router.patch('/:id/suspend', ...guard, suspendClub);

module.exports = router;
