require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');
const Staff = require('./models/Staff');
const Booking = require('./models/Booking');
const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        // Clear existing data
        await User.deleteMany({});
        await Room.deleteMany({});
        await Staff.deleteMany({});
        await Booking.deleteMany({});
        console.log('Cleared existing data');
        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@smartstay.com',
            password: 'admin123',
            phone: '+91 9876543210',
            role: 'admin'
        });
        console.log('✅ Admin created: admin@smartstay.com / admin123');
        // Create sample customer
        const customer = await User.create({
            name: 'Yash Sharma',
            email: 'yash@example.com',
            password: 'customer123',
            phone: '+91 9988776655',
            role: 'customer',
            address: '123, MG Road, Bangalore'
        });
        console.log('✅ Customer created: yash@example.com / customer123');
        // Create sample rooms
        const rooms = await Room.insertMany([
            { number: '101', type: 'single', price: 2500, floor: 1, capacity: 1, status: 'available', amenities: ['WiFi', 'AC', 'TV'], description: 'Cozy single room with city view' },
            { number: '102', type: 'single', price: 2500, floor: 1, capacity: 1, status: 'available', amenities: ['WiFi', 'AC', 'TV'], description: 'Comfortable single room' },
            { number: '201', type: 'double', price: 4500, floor: 2, capacity: 2, status: 'available', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'], description: 'Spacious double room with balcony' },
            { number: '202', type: 'double', price: 4500, floor: 2, capacity: 2, status: 'available', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'], description: 'Double room with garden view' },
            { number: '301', type: 'suite', price: 8000, floor: 3, capacity: 3, status: 'available', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi', 'Living Room'], description: 'Luxury suite with panoramic view' },
            { number: '302', type: 'suite', price: 8500, floor: 3, capacity: 3, status: 'maintenance', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi', 'Living Room'], description: 'Premium suite under renovation' },
            { number: '401', type: 'deluxe', price: 12000, floor: 4, capacity: 4, status: 'available', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi', 'Living Room', 'Kitchen', 'Private Pool'], description: 'Presidential deluxe suite' },
            { number: '103', type: 'single', price: 2800, floor: 1, capacity: 1, status: 'available', amenities: ['WiFi', 'AC', 'TV', 'Work Desk'], description: 'Business single room' },
            { number: '203', type: 'double', price: 5000, floor: 2, capacity: 2, status: 'available', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Bathtub'], description: 'Premium double room' },
            { number: '402', type: 'deluxe', price: 15000, floor: 4, capacity: 4, status: 'available', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi', 'Living Room', 'Kitchen', 'Private Pool', 'Butler Service'], description: 'Royal penthouse suite' },
        ]);
        console.log(`✅ ${rooms.length} rooms created`);
        // Create sample staff
        const staffMembers = await Staff.insertMany([
            { name: 'Priya Singh', email: 'priya@smartstay.com', phone: '+91 9111222333', role: 'Front Desk Manager', department: 'front-desk', shift: 'morning', salary: 35000, status: 'active' },
            { name: 'Amit Kumar', email: 'amit@smartstay.com', phone: '+91 9222333444', role: 'Receptionist', department: 'front-desk', shift: 'afternoon', salary: 22000, status: 'active' },
            { name: 'Deepa Nair', email: 'deepa@smartstay.com', phone: '+91 9333444555', role: 'Head Housekeeper', department: 'housekeeping', shift: 'morning', salary: 28000, status: 'active' },
            { name: 'Raj Patel', email: 'raj@smartstay.com', phone: '+91 9444555666', role: 'Chef', department: 'kitchen', shift: 'morning', salary: 45000, status: 'active' },
            { name: 'Vikram Reddy', email: 'vikram@smartstay.com', phone: '+91 9555666777', role: 'Security Head', department: 'security', shift: 'night', salary: 30000, status: 'active' },
            { name: 'Sunita Devi', email: 'sunita@smartstay.com', phone: '+91 9666777888', role: 'Maintenance Lead', department: 'maintenance', shift: 'morning', salary: 25000, status: 'on-leave' },
        ]);
        console.log(`✅ ${staffMembers.length} staff members created`);
        // Create sample bookings
        const today = new Date();
        const bookings = await Booking.insertMany([
            {
                guest: customer._id,
                room: rooms[2]._id,  // Room 201
                checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
                checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                guests: 2,
                totalAmount: 13500,
                status: 'checked-in',
                paymentStatus: 'paid'
            },
            {
                guest: customer._id,
                room: rooms[0]._id,  // Room 101
                checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
                checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8),
                guests: 1,
                totalAmount: 7500,
                status: 'confirmed',
                paymentStatus: 'pending'
            }
        ]);

        // Mark room 201 as occupied for active booking
        await Room.findByIdAndUpdate(rooms[2]._id, { status: 'occupied' });
        console.log(`✅ ${bookings.length} bookings created`);
        console.log('\n🎉 Seed completed successfully!\n');
        console.log('Admin Login: admin@smartstay.com / admin123');
        console.log('Customer Login: rahul@example.com / customer123\n');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};
seed();
