import { body } from "express-validator";

const CITIES = ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo"];
const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s'\-&.]+$/;
const ADDRESS_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,'-]+$/;
const LETTERS_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'\-.]+$/;

export const complexRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido.")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras, números, guiones y &."),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("La dirección es requerida.")
    .isLength({ min: 5, max: 120 })
    .withMessage("La dirección debe tener entre 5 y 120 caracteres.")
    .matches(ADDRESS_RE)
    .withMessage("La dirección contiene caracteres no permitidos."),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("La ciudad es requerida.")
    .isIn(CITIES)
    .withMessage("Ciudad inválida. Opciones: " + CITIES.join(", ")),
  body("price")
    .isFloat({ min: 0.01, max: 999999 })
    .withMessage("El precio debe ser mayor a 0 y máximo $999.999."),
  body("openTime")
    .notEmpty()
    .withMessage("El horario de apertura es requerido.")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("El horario de apertura debe tener formato HH:MM."),
  body("closeTime")
    .notEmpty()
    .withMessage("El horario de cierre es requerido.")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("El horario de cierre debe tener formato HH:MM."),
  body("whatsapp")
    .trim()
    .notEmpty()
    .withMessage("El WhatsApp es requerido.")
    .matches(/^\+?[0-9]{13}$/)
    .withMessage("Teléfono inválido (13 dígitos, sin espacios, ej: +5493813550986)."),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("La descripción es requerida.")
    .isLength({ min: 3, max: 500 })
    .withMessage("La descripción debe tener entre 3 y 500 caracteres."),
  body("depositPercentage")
    .notEmpty()
    .withMessage("El porcentaje de seña es requerido.")
    .isInt({ min: 0, max: 100 })
    .withMessage("La seña debe ser un entero entre 0 y 100."),
];

export const complexUpdateRules = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío.")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras, números, guiones y &."),
  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("La dirección no puede estar vacía.")
    .isLength({ min: 5, max: 120 })
    .withMessage("La dirección debe tener entre 5 y 120 caracteres.")
    .matches(ADDRESS_RE)
    .withMessage("La dirección contiene caracteres no permitidos."),
  body("city").optional().trim().isIn(CITIES).withMessage("Ciudad inválida."),
  body("price")
    .optional()
    .isFloat({ min: 0.01, max: 999999 })
    .withMessage("El precio debe ser mayor a 0 y máximo $999.999."),
  body("openTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("El horario de apertura debe tener formato HH:MM."),
  body("closeTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("El horario de cierre debe tener formato HH:MM."),
  body("whatsapp")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El WhatsApp no puede estar vacío.")
    .matches(/^\+?[0-9]{13}$/)
    .withMessage("Teléfono inválido (13 dígitos, sin espacios, ej: +5493813550986)."),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("La descripción no puede estar vacía.")
    .isLength({ min: 3, max: 500 })
    .withMessage("La descripción debe tener entre 3 y 500 caracteres."),
  body("depositPercentage")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("La seña debe ser un entero entre 0 y 100."),
  body("owner")
    .optional()
    .trim()
    .isLength({ min: 3, max: 60 })
    .withMessage("El nombre del propietario debe tener entre 3 y 60 caracteres.")
    .matches(LETTERS_RE)
    .withMessage("El nombre del propietario solo puede contener letras."),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email del propietario inválido.")
    .isLength({ min: 6, max: 100 })
    .withMessage("El email debe tener entre 6 y 100 caracteres."),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[0-9]{13}$/)
    .withMessage("Teléfono inválido (13 dígitos, sin espacios, ej: +5493813550986)."),
  body("courts")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("El número de pistas debe ser entre 1 y 50."),
  body("province")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("La provincia debe tener entre 3 y 50 caracteres.")
    .matches(LETTERS_RE)
    .withMessage("La provincia solo puede contener letras."),
  body("observations")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 300 })
    .withMessage("Las observaciones deben tener como máximo 300 caracteres."),
];

export const complexAdminCreateRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Nombre: 3–100 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras, números, guiones y &."),
  body("owner")
    .trim()
    .notEmpty()
    .withMessage("El nombre del propietario es requerido.")
    .isLength({ min: 3, max: 60 })
    .withMessage("Nombre del propietario: 3–60 caracteres.")
    .matches(LETTERS_RE)
    .withMessage("El nombre del propietario solo puede contener letras."),
  body("ownerEmail")
    .trim()
    .notEmpty()
    .withMessage("El email del propietario es requerido.")
    .isEmail()
    .withMessage("Email válido del propietario requerido."),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es requerido.")
    .matches(/^\+?[0-9]{13}$/)
    .withMessage("Teléfono inválido (13 dígitos, sin espacios, ej: +5493813550986)."),
  body("courts")
    .notEmpty()
    .withMessage("El número de pistas es requerido.")
    .isInt({ min: 1, max: 50 })
    .withMessage("El número de pistas debe ser entre 1 y 50."),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("La ciudad es requerida.")
    .isIn(CITIES)
    .withMessage("Ciudad inválida."),
  body("address")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 5, max: 120 })
    .withMessage("Dirección: 5–120 caracteres.")
    .matches(ADDRESS_RE)
    .withMessage("La dirección contiene caracteres no permitidos."),
  body("province")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("La provincia debe tener entre 3 y 50 caracteres.")
    .matches(LETTERS_RE)
    .withMessage("La provincia solo puede contener letras."),
  body("observations")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Observaciones: máx. 300 caracteres."),
];

export const complexReasonRules = [
  body("reason")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 300 })
    .withMessage("El motivo debe tener como máximo 300 caracteres."),
];
