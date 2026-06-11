import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Complejo from '../models/Complejo.js';
import ActivityLog from '../models/ActivityLog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const seed = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI no está definida en .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB conectado para seed');

  await Promise.all([
    User.deleteMany({}),
    Complejo.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);
  console.log('🗑️  Colecciones limpiadas');

  const superAdmin = await User.create({
    nombre: 'Super',
    apellido: 'Admin',
    email: 'superadmin@padeltime.com',
    password: 'Admin1234!',
    role: 'SUPER_ADMIN',
  });

  const owner = await User.create({
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    email: 'owner@padeltime.com',
    password: 'Owner1234!',
    role: 'owner',
  });

  const complejos = await Complejo.insertMany([
    {
      owner: owner._id,
      name: 'Pista Sur Padel',
      location: 'Av. San Martín 1234',
      city: 'Buenos Aires',
      courts: 4,
      price: 25000,
      openTime: '08:00',
      closeTime: '22:00',
      status: 'pending',
    },
    {
      owner: owner._id,
      name: 'Centro Padel Norte',
      location: 'Ruta 9 km 40',
      city: 'Rosario',
      courts: 2,
      price: 20000,
      openTime: '07:00',
      closeTime: '23:00',
      status: 'pending',
    },
    {
      owner: owner._id,
      name: 'MARCOS PAZ PADEL',
      location: 'Av. Libertad 500',
      city: 'Marcos Paz',
      courts: 6,
      price: 30000,
      openTime: '07:00',
      closeTime: '23:30',
      status: 'approved',
    },
    {
      owner: owner._id,
      name: 'Complejo Las Palmas',
      location: 'Belgrano 789',
      city: 'Córdoba',
      courts: 3,
      price: 22000,
      openTime: '08:00',
      closeTime: '22:00',
      status: 'rejected',
      rejectReason: 'Documentación incompleta',
    },
    {
      owner: owner._id,
      name: 'Padel Park Tucumán',
      location: 'San Lorenzo 456',
      city: 'San Miguel De Tucumán',
      courts: 5,
      price: 18000,
      openTime: '08:00',
      closeTime: '23:00',
      status: 'suspended',
      rejectReason: 'Incumplimiento de normativas',
    },
  ]);

  await ActivityLog.insertMany([
    {
      action: 'approved',
      complexId: complejos[2]._id,
      complexName: complejos[2].name,
      adminId: superAdmin._id,
      adminName: 'Super Admin',
      reason: null,
    },
    {
      action: 'rejected',
      complexId: complejos[3]._id,
      complexName: complejos[3].name,
      adminId: superAdmin._id,
      adminName: 'Super Admin',
      reason: 'Documentación incompleta',
    },
    {
      action: 'suspended',
      complexId: complejos[4]._id,
      complexName: complejos[4].name,
      adminId: superAdmin._id,
      adminName: 'Super Admin',
      reason: 'Incumplimiento de normativas',
    },
  ]);

  console.log('\n✅ Seed completado:');
  console.log('   SUPER_ADMIN → superadmin@padeltime.com / Admin1234!');
  console.log('   Owner       → owner@padeltime.com / Owner1234!');
  console.log(`   Complejos   → ${complejos.length} (2 pending, 1 approved, 1 rejected, 1 suspended)`);

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Error en seed:', err.message);
  process.exit(1);
});
