import { body } from "express-validator";

const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'-]+(?: [a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'-]+)*$/;

export const contactRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("El email no es válido.")
    .isLength({ min: 6, max: 100 })
    .withMessage("El email debe tener entre 6 y 100 caracteres."),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("El mensaje es obligatorio.")
    .isLength({ min: 10, max: 350 })
    .withMessage("El mensaje debe tener entre 10 y 350 caracteres."),
];
