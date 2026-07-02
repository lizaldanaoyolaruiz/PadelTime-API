import { Router } from "express";
import { sendContact } from "../controllers/contactController.js";
import validate from "../middlewares/validateMiddleware.js";
import { contactRules } from "../middlewares/contactValidationMiddleware.js";

const router = Router();

router.post("/", contactRules, validate, sendContact);

export default router;
