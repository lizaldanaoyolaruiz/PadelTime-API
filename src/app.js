import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares obligatorios
app.use(cors());          // Permite que tu frontend se conecte a esta API
app.use(express.json());   // Permite que la API entienda cuando le mandas datos en JSON

// Una ruta de prueba para saber si el servidor responde
app.use('/api/health', (req, res) => {
    res.json({ status: 'Servidor de PadelTime funcionando correctamente' });
});

export default app;