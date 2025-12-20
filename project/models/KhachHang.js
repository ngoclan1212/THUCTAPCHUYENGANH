const mongoose = require('mongoose');

const KhachHangSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            default: ''
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true // tự tạo createdAt, updatedAt
    }
);

// Export model
module.exports = mongoose.model('KhachHang', KhachHangSchema);
