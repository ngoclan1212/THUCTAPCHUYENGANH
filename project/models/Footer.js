const mongoose = require('mongoose');

const FooterSchema = new mongoose.Schema({
    shopName: String,
    slogan: String,
    address: String,
    hotline: String,
    email: String,
    openHours: String,

    support1: String,
    support2: String,
    support3: String,
    support4: String,

    tag1: String,
    tag2: String,

    copyright: String
});

module.exports = mongoose.model('Footer', FooterSchema);
