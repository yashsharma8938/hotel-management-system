const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled'],
        default: 'confirmed'
    },
    specialRequests: { type: String, default: '' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
