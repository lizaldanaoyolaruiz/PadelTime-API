require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB\n');

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Colecciones en la DB:', collections.map(c => c.name).join(', '));
  console.log('');

  const docs = await mongoose.connection.collection('complexes')
    .find({})
    .project({ _id: 1, name: 1, mpAccessToken: 1, mercadopagoActive: 1 })
    .toArray();

  console.log(`[complexes] — ${docs.length} documento(s):`);
  docs.forEach(d => {
    const token = d.mpAccessToken ? d.mpAccessToken.slice(0, 20) + '...' : '(no configurado)';
    console.log(`  _id: ${d._id}  name: ${d.name}  token: ${token}  mpActive: ${d.mercadopagoActive}`);
  });

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => { console.error(err.message); process.exit(1); });
