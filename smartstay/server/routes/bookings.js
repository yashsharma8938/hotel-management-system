const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get all bookings (admin gets all, customer gets own)
router.get('/', auth, async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { guest: req.user._id };
        const bookings = await Booking.find(filter)
            .populate('guest', 'name email phone')
            .populate('room', 'number type price floor')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single booking
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('guest', 'name email phone')
            .populate('room', 'number type price floor');
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        // Customers can only see their own bookings
        if (req.user.role === 'customer' && booking.guest._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create booking (customer books for self, admin can book for anyone)
router.post('/', auth, async (req, res) => {
    try {
        const { room: roomId, checkIn, checkOut, guests, specialRequests } = req.body;
        const guestId = req.user.role === 'admin' ? (req.body.guest || req.user._id) : req.user._id;

        // Check room availability
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found.' });
        if (room.status === 'occupied' || room.status === 'maintenance') {
            return res.status(400).json({ message: `Room is currently ${room.status}.` });
        }

        // Check for overlapping bookings
        const overlap = await Booking.findOne({
            room: roomId,
            status: { $in: ['confirmed', 'checked-in'] },
            $or: [
                { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
            ]
        });
        if (overlap) {
            return res.status(400).json({ message: 'Room is already booked for the selected dates.' });
        }

        // Calculate total
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const totalAmount = nights * room.price;

        const booking = new Booking({
            guest: guestId,
            room: roomId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests: guests || 1,
            totalAmount,
            specialRequests,
            status: 'confirmed'
        });
        await booking.save();

        // Mark room as reserved
        await Room.findByIdAndUpdate(roomId, { status: 'reserved' });

        const populated = await Booking.findById(booking._id)
            .populate('guest', 'name email phone')
            .populate('room', 'number type price floor');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update booking status (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        const { status, paymentStatus } = req.body;

        if (status === 'checked-in') {
            await Room.findByIdAndUpdate(booking.room, { status: 'occupied' });
        } else if (status === 'checked-out' || status === 'cancelled') {
            await Room.findByIdAndUpdate(booking.room, { status: 'available' });
        }

        if (status) booking.status = status;
        if (paymentStatus) booking.paymentStatus = paymentStatus;
        await booking.save();

        const updated = await Booking.findById(booking._id)
            .populate('guest', 'name email phone')
            .populate('room', 'number type price floor');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel booking (customer can cancel own, admin can cancel any)
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        if (req.user.role === 'customer' && booking.guest.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        booking.status = 'cancelled';
        await booking.save();
        await Room.findByIdAndUpdate(booking.room, { status: 'available' });
        res.json({ message: 'Booking cancelled successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
