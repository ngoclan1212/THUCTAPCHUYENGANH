const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
    pageTitle: String,
    mainDescription: String,
    missionText: String,

    bannerImg: String,

    imageLarge: String,
    imageSmall: String,

    values: [
        {
            icon: String,
            title: String,
            description: String,
            isActive: Boolean
        }
    ],

    creativeTitle: String,
    creativeDescription: String,
    creativeImage: String,

    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Page', PageSchema);
