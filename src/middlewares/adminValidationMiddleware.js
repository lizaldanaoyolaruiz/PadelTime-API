import { body } from "express-validator";

export const createAdminUserRules = [
  body("name").trim().notEmpty().withMessage("El nombre es obligatorio."),
  body("email").isEmail().withMessage("Email inválido.").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres."),
];

export const updateAdminUserRules = [
  body("email").optional().isEmail().normalizeEmail(),
  body("password").optional().isLength({ min: 8 }),
];

export const toggleAdminStatusRules = [
  body("status")
    .isIn(["approved", "suspended"])
    .withMessage("Estado inválido."),
];

export const adminReasonRules = [body("reason").optional().trim()];
