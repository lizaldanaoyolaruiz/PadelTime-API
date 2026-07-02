import { body } from "express-validator";

const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE_RE = /^\+?[0-9]{13}$/;

const isManualFlow = (value, { req }) => Boolean(req.body.canchaId);

export const createBookingRules = [
  body("court")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Cancha inválida."),
  body("canchaId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Cancha inválida."),
  body("date")
    .optional({ values: "falsy" })
    .matches(DATE_RE)
    .withMessage("Formato de fecha inválido (YYYY-MM-DD)."),
  body("fecha")
    .optional({ values: "falsy" })
    .matches(DATE_RE)
    .withMessage("Formato de fecha inválido (YYYY-MM-DD)."),
  body("startTime")
    .optional({ values: "falsy" })
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
  body("horaInicio")
    .optional({ values: "falsy" })
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
  body("endTime")
    .optional({ values: "falsy" })
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
  body("confirmationMethod")
    .optional({ values: "falsy" })
    .isIn(["manual", "mercadopago", "whatsapp"])
    .withMessage("Método de confirmación inválido."),
  body("totalAmount")
    .optional({ values: "falsy" })
    .isFloat({ min: 0, max: 9999999 })
    .withMessage("Monto total inválido."),
  body("depositAmount")
    .optional({ values: "falsy" })
    .isFloat({ min: 0, max: 9999999 })
    .withMessage("Monto de seña inválido."),
  body("observaciones")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las observaciones deben tener como máximo 500 caracteres."),
  body("jugadorNombre")
    .if(isManualFlow)
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido.")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras."),
  body("jugadorApellido")
    .if(isManualFlow)
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido.")
    .isLength({ min: 3, max: 50 })
    .withMessage("El apellido debe tener entre 3 y 50 caracteres.")
    .matches(NAME_RE)
    .withMessage("El apellido solo puede contener letras."),
  body("jugadorEmail")
    .if(isManualFlow)
    .trim()
    .notEmpty()
    .withMessage("El email es requerido.")
    .isLength({ min: 5, max: 100 })
    .withMessage("El email debe tener entre 5 y 100 caracteres.")
    .matches(EMAIL_RE)
    .withMessage("Email inválido."),
  body("jugadorTelefono")
    .if(isManualFlow)
    .trim()
    .notEmpty()
    .withMessage("El teléfono es requerido.")
    .matches(PHONE_RE)
    .withMessage("Teléfono inválido (13 dígitos, sin espacios, ej: +5493813550986)."),
];

export const editBookingRules = [
  body("date")
    .notEmpty()
    .withMessage("La fecha es requerida.")
    .matches(DATE_RE)
    .withMessage("Formato de fecha inválido (YYYY-MM-DD)."),
  body("startTime")
    .notEmpty()
    .withMessage("La hora de inicio es requerida.")
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
  body("endTime")
    .notEmpty()
    .withMessage("La hora de fin es requerida.")
    .matches(TIME_RE)
    .withMessage("Formato de hora inválido (HH:MM)."),
];
