const mongoose = require('mongoose');

const loaiHoaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('LoaiHoa', loaiHoaSchema);
