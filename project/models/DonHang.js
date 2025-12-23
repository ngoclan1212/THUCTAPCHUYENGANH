const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DonHangSchema = new Schema({
    user: {
        name: String,
        phone: String,
        address: String,
        email: String
    },
    items: [
        {
            name: String,
            qty: Number,
            price: Number,
            img: String
        }
    ],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.DonHang || mongoose.model('DonHang', DonHangSchema);