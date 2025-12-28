

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['bohoa', 'giohoa', 'top'],
        required: true
    },
    description: { type: String },
    meaning: { type: String }
});

module.exports = mongoose.model('categories', CategorySchema);
