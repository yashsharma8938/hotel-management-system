const express = require('express');
const Staff = require('../models/Staff');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get all staff (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const { department, status } = req.query;
        const filter = {};
        if (department) filter.department = department;
        if (status) filter.status = status;
        const staff = await Staff.find(filter).sort({ createdAt: -1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single staff
router.get('/:id', auth, adminOnly, async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff member not found.' });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create staff
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const staff = new Staff(req.body);
        await staff.save();
        res.status(201).json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update staff
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!staff) return res.status(404).json({ message: 'Staff member not found.' });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete staff
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff member not found.' });
        res.json({ message: 'Staff member deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
