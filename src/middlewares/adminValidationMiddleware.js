import { body } from "express-validator";

const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'-]+(?: [a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'-]+)*$/;
const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).+$/;
const CITIES = ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo"];

export const createAdminUserRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isLength({ min: 3, max: 101 })
    .withMessage("El nombre debe tener entre 3 y 101 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras."),
  body("email")
    .isEmail()
    .withMessage("Email inválido.")
    .isLength({ min: 6, max: 100 })
    .withMessage("El email debe tener entre 6 y 100 caracteres.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 64 })
    .withMessage("La contraseña debe tener entre 8 y 64 caracteres.")
    .matches(STRONG_PW)
    .withMessage(
      "La contraseña debe incluir mayúscula, minúscula, número y carácter especial.",
    ),
  body("location")
    .optional({ values: "falsy" })
    .isIn(CITIES)
    .withMessage("Ciudad inválida."),
];

export const updateAdminUserRules = [
  body("name")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 101 })
    .withMessage("El nombre debe tener entre 3 y 101 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras."),
  body("email")
    .optional({ values: "falsy" })
    .isEmail()
    .withMessage("Email inválido.")
    .isLength({ min: 6, max: 100 })
    .withMessage("El email debe tener entre 6 y 100 caracteres.")
    .normalizeEmail(),
  body("password")
    .optional({ values: "falsy" })
    .isLength({ min: 8, max: 64 })
    .withMessage("La contraseña debe tener entre 8 y 64 caracteres.")
    .matches(STRONG_PW)
    .withMessage(
      "La contraseña debe incluir mayúscula, minúscula, número y carácter especial.",
    ),
  body("location")
    .optional({ values: "falsy" })
    .isIn(CITIES)
    .withMessage("Ciudad inválida."),
];

export const toggleAdminStatusRules = [
  body("status")
    .isIn(["approved", "suspended"])
    .withMessage("Estado inválido."),
];

export const adminReasonRules = [
  body("reason")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 300 })
    .withMessage("El motivo debe tener como máximo 300 caracteres."),
];
