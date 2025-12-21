const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String },
    // Liên kết với Category qua ID
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },
    status: { type: Boolean, default: true }
});

module.exports = mongoose.model('products', ProductSchema);