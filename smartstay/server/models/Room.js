const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    type: { type: String, enum: ['single', 'double', 'suite', 'deluxe'], required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved'], default: 'available' },
    floor: { type: Number, required: true },
    capacity: { type: Number, default: 2 },
    amenities: [{ type: String }],
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
