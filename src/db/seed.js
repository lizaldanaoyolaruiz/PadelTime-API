import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definida en .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado para seed');

  await Promise.all([
    User.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);
  console.log('Colecciones limpiadas');

  await User.create({
    name: 'Super Admin',
    email: 'superadmin@padeltime.com',
    password: 'Admin1234!',
    role: 'superadmin',
    status: 'approved',
    isVerified: true,
  });

  console.log('Seed completado:');
  console.log('  superadmin@padeltime.com / Admin1234!');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
