import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import complejosRoutes from './src/routes/complejosRoutes.js';
import canchasRoutes from './src/routes/canchasRoutes.js';
import reservasRoutes from './src/routes/reservasRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Servidor de PadelTime funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/complejos', complejosRoutes);
app.use('/api/complexes', complejosRoutes);
app.use('/api/canchas', canchasRoutes);
app.use('/api/reservas', reservasRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
