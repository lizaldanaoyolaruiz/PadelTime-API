const { Router } = require('express');
const {
  getAllComplejos,
  aprobarComplejo,
  rechazarComplejo,
  suspenderComplejo,
} = require('../controllers/superAdminController');
const { protectSuperAdmin } = require('../middlewares/superAdminMiddleware');

const router = Router();

router.get('/complejos', protectSuperAdmin, getAllComplejos);
router.patch('/complejos/:id/aprobar', protectSuperAdmin, aprobarComplejo);
router.patch('/complejos/:id/rechazar', protectSuperAdmin, rechazarComplejo);
router.patch('/complejos/:id/suspender', protectSuperAdmin, suspenderComplejo);

module.exports = router;
