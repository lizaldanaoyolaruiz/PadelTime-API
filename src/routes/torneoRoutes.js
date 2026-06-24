import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTorneos, getTorneoById, createTorneo, updateTorneo, deleteTorneo,
} from '../controllers/torneoController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';

const router = Router();

const torneoRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres.'),
  body('descripcion').optional({ nullable: true, checkFalsy: true }).trim()
    .isLength({ max: 500 }).withMessage('Máximo 500 caracteres.'),
  body('fechaInicio').notEmpty().withMessage('La fecha de inicio es obligatoria.')
    .isISO8601().withMessage('Fecha de inicio inválida.'),
  body('fechaFin').notEmpty().withMessage('La fecha de fin es obligatoria.')
    .isISO8601().withMessage('Fecha de fin inválida.'),
  body('ubicacion').trim().notEmpty().withMessage('La ubicación es obligatoria.')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres.'),
  body('cupoMaximo').isInt({ min: 1, max: 9999 })
    .withMessage('El cupo debe ser un entero entre 1 y 9999.'),
  body('categoria')
    .isIn(['amateur', 'intermedio', 'avanzado', 'profesional', 'mixto'])
    .withMessage('Categoría inválida.'),
  body('estado').optional()
    .isIn(['activo', 'finalizado', 'cancelado'])
    .withMessage('Estado inválido.'),
];

router.get('/',    getTorneos);
router.get('/:id', getTorneoById);

router.post('/',    protect, requireRole('admin', 'superadmin'), torneoRules, validate, createTorneo);
router.put('/:id',  protect, requireRole('admin', 'superadmin'), torneoRules, validate, updateTorneo);
router.delete('/:id', protect, requireRole('admin', 'superadmin'), deleteTorneo);

export default router;
