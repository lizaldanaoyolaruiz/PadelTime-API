import express from "express";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserFullProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);

router.get("/:id/full", getUserFullProfile);

router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
