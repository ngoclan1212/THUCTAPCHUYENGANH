const mongoose = require('mongoose');

const DonHangSchema = new mongoose.Schema({
    user: {
        name: String,
        email: String,
        phone: String,
        address: String
    },
    items: [],
    total: Number,
    status: {
        type: String,
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('DonHang', DonHangSchema);
