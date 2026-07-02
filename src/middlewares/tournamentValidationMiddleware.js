import { body } from "express-validator";

const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s'\-&.]+$/;
const ADDRESS_RE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,'-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const tournamentRules = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido.")
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe tener entre 3 y 100 caracteres.")
    .matches(NAME_RE)
    .withMessage("El nombre solo puede contener letras, números, guiones y &."),
  body("fechaInicio")
    .notEmpty()
    .withMessage("La fecha de inicio es requerida.")
    .matches(DATE_RE)
    .withMessage("Formato de fecha inválido (YYYY-MM-DD)."),
  body("fechaFin")
    .notEmpty()
    .withMessage("La fecha de fin es requerida.")
    .matches(DATE_RE)
    .withMessage("Formato de fecha inválido (YYYY-MM-DD)."),
  body("ubicacion")
    .trim()
    .notEmpty()
    .withMessage("La ubicación es requerida.")
    .isLength({ min: 3, max: 100 })
    .withMessage("La ubicación debe tener entre 3 y 100 caracteres.")
    .matches(ADDRESS_RE)
    .withMessage("La ubicación contiene caracteres no permitidos."),
  body("cupoMaximo")
    .isInt({ min: 1, max: 9999 })
    .withMessage("El cupo debe ser entre 1 y 9999."),
  body("categoria")
    .isIn(["amateur", "intermedio", "avanzado", "profesional", "mixto"])
    .withMessage("Categoría inválida."),
  body("estado")
    .optional()
    .isIn(["activo", "finalizado", "cancelado"])
    .withMessage("Estado inválido."),
  body("descripcion")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Descripción máx. 500 caracteres."),
  body("whatsapp")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^\+?[0-9]{13}$/)
    .withMessage("Teléfono inválido (13 dígitos, sin espacios, ej: +5493813550986)."),
];
