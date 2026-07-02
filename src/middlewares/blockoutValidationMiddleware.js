import { body } from "express-validator";

const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-/]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAYS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

export const createBlockoutRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido.")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres.")
    .matches(NAME_RE)
    .withMessage("Solo letras, números, espacios y guiones."),
  body("recurrence")
    .notEmpty()
    .withMessage("La recurrencia es requerida.")
    .isIn(["once", "daily", "weekly"])
    .withMessage("Recurrencia inválida."),
  body("dayOfWeek")
    .optional({ values: "falsy" })
    .isIn(DAYS)
    .withMessage("Día de la semana inválido."),
  body("date")
    .optional({ values: "falsy" })
    .matches(DATE_RE)
    .withMessage("Formato de fecha inválido (YYYY-MM-DD)."),
  body("startTime")
    .notEmpty()
    .withMessage("El horario de inicio es requerido.")
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
  body("endTime")
    .notEmpty()
    .withMessage("El horario de fin es requerido.")
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
  body("courtId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Cancha inválida."),
  body("complexId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Complejo inválido."),
];

export const updateBlockoutRules = [
  body("name")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres.")
    .matches(NAME_RE)
    .withMessage("Solo letras, números, espacios y guiones."),
  body("recurrence")
    .optional({ values: "falsy" })
    .isIn(["once", "daily", "weekly"])
    .withMessage("Recurrencia inválida."),
  body("dayOfWeek")
    .optional({ values: "falsy" })
    .isIn(DAYS)
    .withMessage("Día de la semana inválido."),
  body("date")
    .optional({ values: "falsy" })
    .matches(DATE_RE)
    .withMessage("Formato de fecha inválido (YYYY-MM-DD)."),
  body("startTime")
    .optional({ values: "falsy" })
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
  body("endTime")
    .optional({ values: "falsy" })
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
  body("courtId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Cancha inválida."),
  body("complexId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Complejo inválido."),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive debe ser booleano."),
];
