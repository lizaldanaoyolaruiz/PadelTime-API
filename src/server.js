import app from './app.js';
import dotenv from 'dotenv';

// Carga las variables del archivo .env
dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo con éxito en http://localhost:${PORT}`);
});