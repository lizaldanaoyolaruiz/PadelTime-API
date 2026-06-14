import { Router } from 'express';
import {
  getReservasOwner,
  getReservasJugador,
  crearReserva,
  crearReservaOwner,
  confirmarReserva,
  rechazarReserva,
  cancelarReserva,
} from '../controllers/reservasController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { soloOwner, soloPlayer } from '../middlewares/roleMiddleware.js';

const router = Router();

// Owner: ver reservas de su complejo (?cancha=&fecha=&estado=)
router.get('/owner', proteger, soloOwner, getReservasOwner);

// Jugador: ver sus propias reservas
router.get('/mis-reservas', proteger, soloPlayer, getReservasJugador);

// Owner: crear una reserva manual
router.post('/manual', proteger, soloOwner, crearReservaOwner);

// Jugador: crear una reserva
router.post('/', proteger, soloPlayer, crearReserva);

// Owner: confirmar o rechazar una reserva pendiente
router.patch('/:id/confirmar', proteger, soloOwner, confirmarReserva);
router.patch('/:id/rechazar', proteger, soloOwner, rechazarReserva);

// Jugador u owner: cancelar
router.patch('/:id/cancelar', proteger, cancelarReserva);

export default router;
