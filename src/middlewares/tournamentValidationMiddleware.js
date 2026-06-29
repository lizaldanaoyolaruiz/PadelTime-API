import { body } from 'express-validator';

export const tournamentRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('fechaInicio').notEmpty().withMessage('La fecha de inicio es requerida.'),
  body('fechaFin').notEmpty().withMessage('La fecha de fin es requerida.'),
  body('ubicacion').trim().notEmpty().withMessage('La ubicación es requerida.')
    .isLength({ min: 3, max: 100 }).withMessage('La ubicación debe tener entre 3 y 100 caracteres.'),
  body('cupoMaximo').isInt({ min: 1, max: 9999 }).withMessage('El cupo debe ser entre 1 y 9999.'),
  body('categoria').isIn(['amateur', 'intermedio', 'avanzado', 'profesional', 'mixto'])
    .withMessage('Categoría inválida.'),
  body('estado').optional().isIn(['activo', 'finalizado', 'cancelado']).withMessage('Estado inválido.'),
  body('descripcion').optional().trim().isLength({ max: 500 }).withMessage('Descripción máx. 500 caracteres.'),
  body('whatsapp').optional().trim().isLength({ max: 20 }).withMessage('WhatsApp máx. 20 caracteres.'),
];
