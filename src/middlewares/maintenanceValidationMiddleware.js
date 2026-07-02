import { body } from "express-validator";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const maintenanceRules = [
  body("courtId").isMongoId().withMessage("Cancha inválida."),
  body("date")
    .notEmpty()
    .withMessage("La fecha es requerida.")
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
  body("motivo")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 150 })
    .withMessage("El motivo debe tener como máximo 150 caracteres."),
];
