const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    department: {
        type: String,
        enum: ['front-desk', 'housekeeping', 'kitchen', 'management', 'security', 'maintenance'],
        required: true
    },
    shift: { type: String, enum: ['morning', 'afternoon', 'night'], default: 'morning' },
    salary: { type: Number, required: true },
    joinDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'on-leave', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Staff', staffSchema);
