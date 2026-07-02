import { body } from "express-validator";

const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'-]+(?: [a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'-]+)*$/;
const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).+$/;

export const registerRules = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido.")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras."),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido.")
    .isLength({ min: 3, max: 50 })
    .withMessage("El apellido debe tener entre 3 y 50 caracteres.")
    .matches(NAME_RE)
    .withMessage("El apellido solo puede contener letras."),
  body("name")
    .notEmpty()
    .withMessage("El nombre es requerido.")
    .isLength({ min: 3, max: 101 })
    .withMessage("El nombre debe tener entre 3 y 101 caracteres."),
  body("email")
    .isEmail()
    .withMessage("Debe ingresar un email válido.")
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
  body("role")
    .optional()
    .isIn(["player", "admin"])
    .withMessage("El rol debe ser player o admin."),
];

export const loginRules = [
  body("email")
    .isEmail()
    .withMessage("Debe ingresar un email válido.")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida.")
    .isLength({ min: 8, max: 64 })
    .withMessage("La contraseña debe tener entre 8 y 64 caracteres."),
];

export const updateMeRules = [
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
    .withMessage("Debe ingresar un email válido.")
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
];
