const mongoose = require('mongoose');

const complejoSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  owner:        { type: String, required: true },
  email:        { type: String, required: true },
  phone:        { type: String, required: true },
  city:         { type: String, required: true },
  province:     { type: String, required: true },
  address:      { type: String, required: true },
  courts:       { type: Number, required: true, min: 1 },
  status:       { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' },
  observations: { type: String, default: '' },
  image:        { type: String, default: null },
  registeredAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

module.exports = mongoose.model('Complejo', complejoSchema);
