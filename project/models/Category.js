// const mongoose = require('mongoose');
//
// const Schema = mongoose.Schema;
// const CategorySchema = new Schema({
//     name: {
//         type:String,
//         required:true,
//     },
//     image: {
//         type:String,
//         required:true,
//     },
//     status: {
//         type:Boolean,
//         required:false,
//     }
// });
// module.exports = mongoose.model('categories', CategorySchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: {            // TÊN HOA
        type: String,
        required: true
    },
    image: {           // HÌNH ẢNH
        type: String,
        required: true
    },
    price: {           // GIÁ
        type: Number,
        required: true
    },
    category: {        // DANH MỤC
        type: String,
        enum: ['bohoa', 'giohoa', 'top'],
        required: true
    },
    description: { type: String },
    meaning: { type: String }
});

module.exports = mongoose.model('categories', CategorySchema);
