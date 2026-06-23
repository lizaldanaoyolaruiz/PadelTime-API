import express from 'express';

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserFullProfile,
} from '../controllers/user.controller.js';

const router = express.Router();

// CRUD usuarios
router.get('/', getUsers);

// PERFIL COMPLETO
router.get('/:id/full', getUserFullProfile);

router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;