import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import complexRoutes from './src/routes/complexRoutes.js';
import courtRoutes from './src/routes/courtRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'PadelTime API running' });
});

app.use('/api/auth',      authRoutes);
app.use('/api/complexes', complexRoutes);
app.use('/api/courts',    courtRoutes);
app.use('/api/bookings',  bookingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Single DB connection — server starts only after DB is ready
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to DB:', err.message);
  process.exit(1);
});
