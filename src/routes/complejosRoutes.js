const { Router } = require('express');
const {
  getAllComplejos, createComplejo, updateComplejo, deleteComplejo,
  approveComplejo, rejectComplejo, suspendComplejo,
} = require('../controllers/complejosController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const router = Router();
const guard = [authMiddleware, roleMiddleware(['superadmin'])];

router.get('/',              ...guard, getAllComplejos);
router.post('/',             ...guard, createComplejo);
router.put('/:id',           ...guard, updateComplejo);
router.delete('/:id',        ...guard, deleteComplejo);
router.patch('/:id/approve', ...guard, approveComplejo);
router.patch('/:id/reject',  ...guard, rejectComplejo);
router.patch('/:id/suspend', ...guard, suspendComplejo);

module.exports = router;
