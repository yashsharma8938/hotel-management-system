const express = require('express');
const Room = require('../models/Room');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get all rooms (public — customers can browse)
router.get('/', async (req, res) => {
    try {
        const { type, status, minPrice, maxPrice } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        const rooms = await Room.find(filter).sort({ floor: 1, number: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single room
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found.' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create room (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update room (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).json({ message: 'Room not found.' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete room (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found.' });
        res.json({ message: 'Room deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
