const mongoose = require('mongoose');

const HeaderSchema = new mongoose.Schema({
    // Tên thương hiệu hiển thị trên Header
    brandName: {
        type: String,
        default: 'N&Fresh Flowers',
        trim: true
    },

    // Class icon của Bootstrap Icons (ví dụ: bi-flower1)
    logoIcon: {
        type: String,
        default: 'bi-flower1'
    },

    // Danh sách các mục menu (Home, Shop, Contact...)
    navItems: [
        {
            label: { type: String, required: true }, // Tên hiển thị (ví dụ: 'Cửa hàng')
            link: { type: String, required: true },  // Đường dẫn (ví dụ: '/shop')
            order: { type: Number, default: 0 }      // Thứ tự sắp xếp
        }
    ],

    // Tùy chọn: Màu sắc hoặc Theme của Header
    theme: {
        type: String,
        enum: ['navbar-light bg-white', 'navbar-dark bg-dark', 'navbar-dark bg-primary'],
        default: 'navbar-light bg-white'
    },

    // Trạng thái cập nhật cuối cùng
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware tự động cập nhật thời gian mỗi khi lưu
HeaderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Header', HeaderSchema);