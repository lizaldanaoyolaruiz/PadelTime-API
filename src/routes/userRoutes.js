const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserFullProfile,
} = require('../controllers/user.controller');

//CRUD usuarios
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// PERFIL COMPLETO (panel de clientes)
router.get('/:id/full', getUserFullProfile);

module.exports = router;