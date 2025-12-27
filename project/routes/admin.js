var express = require('express');
var router = express.Router();
const Contact = require('../models/Contact');
const Page = require('../models/Page');
function useAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Proceed if authenticated
    } else {
        res.redirect('/login'); // Redirect to login if authentication fails
    }
}
router.all('/*', useAuthenticated, (req, res, next) => {
    res.app.locals.layout = 'admin'; // Set layout for admin pages
    next();
});

router.get('/*', function(
    req,
    res,
    next) {
    res.app.locals.layout = 'admin';
    next();
});

router.get('/', function(req, res, next) {
    res.render('admin/index', {title: 'Admin'}) ;
});
router.get('/Dashboard', function(req, res, next) {
    res.render('admin/Dashboard/dashboard', {title: 'Dashboard'}) ;
});
router.get('/product', function(req, res, next) {
    res.render('admin/product/product-list', {title: 'Product'}) ;
});
router.get('/contact', async (req, res) => {
    const contact = await Contact.findOne().lean();
    res.render('admin/contact/edit', {
        contact,
        layout: 'admin' // Sử dụng layout admin.hbs bạn vừa gửi
    });
});

// Xử lý lưu dữ liệu
router.post('/contact/update', async (req, res) => {
    console.log('REQ BODY >>>', req.body);
    const { description, address, hotline, email, workingHours, googleMapsUrl } = req.body;
    try {
        await Contact.findOneAndUpdate({}, {
            description, address, hotline, email, workingHours, googleMapsUrl
        }, { upsert: true });
        req.flash("success", "✅ Cập nhật thông tin liên hệ thành công!");
        res.redirect('/admin/contact');
    } catch (err) {
        res.status(500).send("Lỗi cập nhật: " + err.message);
    }
});
router.get('/page', async (req, res) => {
    const pageData = await Page.findOne().lean();
    res.render('admin/page/edit', {
        pageData,
        layout: 'admin'
    });
});
router.post('/page/update', async (req, res) => {
    try {
        const {
            pageTitle,
            mainDescription,
            missionText,
            bannerImg,
            imageLarge,
            imageSmall,
            creativeTitle,
            creativeDescription,
            creativeImage
        } = req.body;

        const values = [
            {
                icon: req.body.value_icon_1,
                title: req.body.value_title_1,
                description: req.body.value_desc_1,
                isActive: req.body.value_active === '1'
            },
            {
                icon: req.body.value_icon_2,
                title: req.body.value_title_2,
                description: req.body.value_desc_2,
                isActive: req.body.value_active === '2'
            },
            {
                icon: req.body.value_icon_3,
                title: req.body.value_title_3,
                description: req.body.value_desc_3,
                isActive: req.body.value_active === '3'
            }
        ];

        await Page.findOneAndUpdate(
            {},
            {
                pageTitle,
                mainDescription,
                missionText,
                bannerImg,
                imageLarge,
                imageSmall,
                values,
                creativeTitle,
                creativeDescription,
                creativeImage,
                updatedAt: Date.now()
            },
            { upsert: true }
        );

        // ✅ FLASH CHUẨN
        req.flash("success", "✅ Cập nhật Page giới thiệu thành công!");
        res.redirect('/admin/page');

    } catch (err) {
        console.error(err);
        req.flash("error", "❌ Cập nhật Page thất bại!");
        res.redirect('/admin/page');
    }
});


module.exports = router;