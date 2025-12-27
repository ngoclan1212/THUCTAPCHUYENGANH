const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    description: { type: String, required: true },
    address: { type: String, required: true },
    hotline: { type: String, required: true },
    email: { type: String, required: true },
    workingHours: { type: String, required: true },
    googleMapsUrl: { type: String, required: true }
});

module.exports = mongoose.model('Contact', ContactSchema);