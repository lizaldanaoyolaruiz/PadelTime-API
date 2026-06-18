require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
  const token = process.env.MP_SETUP_TOKEN;
  if (!token) {
    console.error('ERROR: MP_SETUP_TOKEN no está en el .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  const result = await mongoose.connection
    .collection('complexes')
    .updateMany({}, { $set: { mpAccessToken: token, mercadopagoActive: true } });

  console.log(`✓ ${result.modifiedCount} complejo(s) actualizados con mpAccessToken`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
