require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
const ActivityLog = require('../models/ActivityLog');

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definida en .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado para seed');

  await Promise.all([
    User.deleteMany({}),
    Club.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);
  console.log('Colecciones limpiadas');

  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'superadmin@padeltime.com',
    password: 'Admin1234!',
    role: 'superadmin',
    status: 'approved',
    isVerified: true,
  });

  const clubs = await Club.insertMany([
    {
      name: 'Pista Sur Padel',
      owner: 'Carlos Rodríguez',
      email: 'carlos@pistasur.com',
      phone: '+54 11 1234 5678',
      city: 'Buenos Aires',
      province: 'Buenos Aires',
      address: 'Av. San Martín 1234',
      courts: 4,
      status: 'PENDING',
      registeredAt: '2026-06-01',
    },
    {
      name: 'Centro Padel Norte',
      owner: 'María López',
      email: 'maria@centronorte.com',
      phone: '+54 341 456 7890',
      city: 'Rosario',
      province: 'Santa Fe',
      address: 'Ruta 9 km 40',
      courts: 2,
      status: 'PENDING',
      registeredAt: '2026-06-03',
    },
    {
      name: 'MARCOS PAZ PADEL',
      owner: 'José García',
      email: 'jose@marcospazpadel.com',
      phone: '+54 220 789 0123',
      city: 'Marcos Paz',
      province: 'Buenos Aires',
      address: 'Av. Libertad 500',
      courts: 6,
      status: 'APPROVED',
      registeredAt: '2026-05-20',
    },
    {
      name: 'Complejo Las Palmas',
      owner: 'Ana Fernández',
      email: 'ana@laspalmas.com',
      phone: '+54 351 321 6547',
      city: 'Córdoba',
      province: 'Córdoba',
      address: 'Belgrano 789',
      courts: 3,
      status: 'REJECTED',
      observations: 'Documentación incompleta',
      registeredAt: '2026-05-15',
    },
    {
      name: 'Padel Park Tucumán',
      owner: 'Luis Torres',
      email: 'luis@padelparktucu.com',
      phone: '+54 381 654 3210',
      city: 'San Miguel de Tucumán',
      province: 'Tucumán',
      address: 'San Lorenzo 456',
      courts: 5,
      status: 'SUSPENDED',
      observations: 'Incumplimiento de normativas',
      registeredAt: '2026-05-10',
    },
  ]);

  await ActivityLog.insertMany([
    {
      action: 'approved',
      complexId: clubs[2]._id,
      complexName: clubs[2].name,
      adminId: superAdmin._id,
      adminName: superAdmin.name,
    },
    {
      action: 'rejected',
      complexId: clubs[3]._id,
      complexName: clubs[3].name,
      adminId: superAdmin._id,
      adminName: superAdmin.name,
      reason: 'Documentación incompleta',
    },
    {
      action: 'suspended',
      complexId: clubs[4]._id,
      complexName: clubs[4].name,
      adminId: superAdmin._id,
      adminName: superAdmin.name,
      reason: 'Incumplimiento de normativas',
    },
  ]);

  console.log('Seed completado:');
  console.log('  superadmin@padeltime.com / Admin1234!');
  console.log(`  ${clubs.length} clubs insertados`);

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
