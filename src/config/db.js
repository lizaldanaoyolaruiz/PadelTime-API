const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado correctamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
  }
};

module.exports = connectDB;
