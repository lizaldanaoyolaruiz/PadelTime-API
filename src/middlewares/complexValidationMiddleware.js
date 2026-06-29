import { body } from 'express-validator';

const CITIES = ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo'];

export const complexRules = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
  body('city').trim().notEmpty().withMessage('La ciudad es requerida.')
    .isIn(CITIES).withMessage('Ciudad inválida. Opciones: ' + CITIES.join(', ')),
  body('price').isFloat({ min: 0.01, max: 999999 }).withMessage('El precio debe ser mayor a 0 y máximo $999.999.'),
  body('openTime').notEmpty().withMessage('El horario de apertura es requerido.')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('openTime debe ser HH:MM.'),
  body('closeTime').notEmpty().withMessage('El horario de cierre es requerido.')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('closeTime debe ser HH:MM.'),
  body('whatsapp').trim().notEmpty().withMessage('El WhatsApp es requerido.')
    .matches(/^\+?[\d\s\-]{7,15}$/).withMessage('Teléfono inválido (7–15 dígitos).'),
  body('description').trim().notEmpty().withMessage('La descripción es requerida.')
    .isLength({ min: 3, max: 500 }).withMessage('La descripción debe tener entre 3 y 500 caracteres.'),
  body('depositPercentage').notEmpty().withMessage('El porcentaje de seña es requerido.')
    .isInt({ min: 0, max: 100 }).withMessage('La seña debe ser un entero entre 0 y 100.'),
];

export const complexUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
  body('city').optional().trim().isIn(CITIES).withMessage('Ciudad inválida.'),
  body('price').optional().isFloat({ min: 0.01, max: 999999 }).withMessage('El precio debe ser mayor a 0 y máximo $999.999.'),
  body('openTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('openTime debe ser HH:MM.'),
  body('closeTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('closeTime debe ser HH:MM.'),
  body('whatsapp').optional().trim().notEmpty().withMessage('El WhatsApp no puede estar vacío.')
    .matches(/^\+?[\d\s\-]{7,15}$/).withMessage('Teléfono inválido (7–15 dígitos).'),
  body('description').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía.')
    .isLength({ min: 3, max: 500 }).withMessage('La descripción debe tener entre 3 y 500 caracteres.'),
  body('depositPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('La seña debe ser un entero entre 0 y 100.'),
];

export const complexAdminCreateRules = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 3, max: 100 }).withMessage('Nombre: 3–100 caracteres.'),
  body('ownerEmail').trim().notEmpty().isEmail().withMessage('Email válido del propietario requerido.'),
  body('city').trim().notEmpty().isIn(CITIES).withMessage('Ciudad inválida.'),
  body('address').optional().trim().isLength({ min: 5, max: 120 }).withMessage('Dirección: 5–120 caracteres.'),
  body('observations').optional().trim().isLength({ max: 300 }).withMessage('Observaciones: máx. 300 caracteres.'),
];

export const complexReasonRules = [
  body('reason').optional().trim(),
];
