import { body } from 'express-validator';

export const courtRules = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres.'),
  body('type').isIn(['crystal', 'panoramic']).withMessage('El tipo debe ser crystal o panoramic.'),
  body('pricePerHour').optional().isFloat({ min: 0, max: 999999 }).withMessage('El precio máximo es $999.999.'),
  body('description').trim().notEmpty().withMessage('La descripción es requerida.')
    .isLength({ min: 3, max: 300 }).withMessage('La descripción debe tener entre 3 y 300 caracteres.'),
];

export const courtUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres.'),
  body('type').optional().isIn(['crystal', 'panoramic']).withMessage('El tipo debe ser crystal o panoramic.'),
  body('pricePerHour').optional().isFloat({ min: 0.01, max: 999999 }).withMessage('El precio debe ser mayor a 0 y máximo $999.999.'),
  body('description').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía.')
    .isLength({ min: 3, max: 300 }).withMessage('La descripción debe tener entre 3 y 300 caracteres.'),
];
