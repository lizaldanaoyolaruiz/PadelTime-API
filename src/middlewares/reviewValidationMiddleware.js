import { body } from "express-validator";

export const reviewRules = [
  body("complexId").notEmpty().withMessage("El complejo es requerido."),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("La calificación debe ser un número entero entre 1 y 5."),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("El comentario debe tener como máximo 1000 caracteres."),
  body("tags").optional().isArray().withMessage("Las etiquetas deben ser un arreglo."),
];

export const updateReviewRules = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("La calificación debe ser un número entero entre 1 y 5."),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("El comentario debe tener como máximo 1000 caracteres."),
  body("tags").optional().isArray().withMessage("Las etiquetas deben ser un arreglo."),
];
