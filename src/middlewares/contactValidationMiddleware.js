import { body } from 'express-validator';

export const contactRules = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('email').trim().isEmail().withMessage('El email no es válido.'),
  body('message').trim().notEmpty().withMessage('El mensaje es obligatorio.')
    .isLength({ max: 2000 }).withMessage('El mensaje no puede superar los 2000 caracteres.'),
];
