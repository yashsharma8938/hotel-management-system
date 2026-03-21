const express = require('express');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Dashboard stats (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments();
        const availableRooms = await Room.countDocuments({ status: 'available' });
        const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
        const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
        const reservedRooms = await Room.countDocuments({ status: 'reserved' });

        const totalBookings = await Booking.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } });
        const totalGuests = await User.countDocuments({ role: 'customer' });
        const totalStaff = await Staff.countDocuments();
        const activeStaff = await Staff.countDocuments({ status: 'active' });

        // Revenue calculation
        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Monthly revenue for chart (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyRevenue = await Booking.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: { $in: ['paid', 'pending'] } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('guest', 'name email')
            .populate('room', 'number type')
            .sort({ createdAt: -1 })
            .limit(5);

        // Room type distribution
        const roomTypeDistribution = await Room.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        res.json({
            stats: {
                totalRooms,
                availableRooms,
                occupiedRooms,
                maintenanceRooms,
                reservedRooms,
                totalBookings,
                activeBookings,
                totalGuests,
                totalStaff,
                activeStaff,
                totalRevenue,
                occupancyRate
            },
            monthlyRevenue,
            recentBookings,
            roomTypeDistribution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
