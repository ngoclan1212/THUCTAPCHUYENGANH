var express = require('express');
var router = express.Router();
const Contact = require('../models/Contact');
const Page = require('../models/Page');
const Header = require('../models/Header');
const Footer = require('../models/Footer');

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
// ... các phần require giữ nguyên ...

// 1. Route GET: Hiển thị trang chỉnh sửa Header
router.get('/header', async (req, res) => {
    try {
        // Tìm bản ghi cấu hình đầu tiên, nếu chưa có thì lấy object rỗng
        let headerConfig = await Header.findOne().lean();

        // Nếu DB chưa có dữ liệu, có thể truyền mặc định để không bị lỗi giao diện
        if (!headerConfig) {
            headerConfig = {
                brandName: 'N&Fresh Flowers',
                logoIcon: 'bi-flower1',
                navItems: [
                    { label: 'Home', link: '/' },
                    { label: 'Shop', link: '/shop' }
                ]
            };
        }

        res.render('admin/header/edit', {
            headerConfig,
            layout: 'admin',
            title: 'Chỉnh sửa Header'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi tải trang Header");
    }
});

// 2. Route POST: Xử lý lưu dữ liệu Header
router.post('/header/update', async (req, res) => {
    try {
        const { brandName, logoIcon, labels, links } = req.body;

        // Xử lý mảng navItems: Kết hợp label và link từ form
        let navItems = [];

        // Kiểm tra nếu labels là mảng (trường hợp có nhiều hơn 1 menu item)
        if (Array.isArray(labels)) {
            navItems = labels.map((label, index) => ({
                label: label,
                link: links[index] || '#'
            }));
        }
        // Trường hợp chỉ có 1 menu item (labels sẽ là string thay vì mảng)
        else if (labels) {
            navItems.push({
                label: labels,
                link: links || '#'
            });
        }

        // Cập nhật vào Database (upsert: true sẽ tạo mới nếu chưa có bản ghi nào)
        await Header.findOneAndUpdate(
            {},
            {
                brandName,
                logoIcon,
                navItems,
                updatedAt: Date.now()
            },
            { upsert: true, new: true }
        );

        req.flash("success", "✅ Cập nhật Header thành công!");
        res.redirect('/admin/header');
    } catch (err) {
        console.error("Lỗi cập nhật Header:", err);
        req.flash("error", "❌ Cập nhật Header thất bại!");
        res.redirect('/admin/header');
    }
});

router.post('/header/update', async (req, res) => {
    const {
        shopName,
        searchPlaceholder,
        showCart,
        menuText,
        menuLink
    } = req.body;

    // 🔒 ÉP menuText & menuLink LUÔN LÀ MẢNG
    const texts = Array.isArray(menuText) ? menuText : (menuText ? [menuText] : []);
    const links = Array.isArray(menuLink) ? menuLink : (menuLink ? [menuLink] : []);

    const menu = texts.map((t, i) => ({
        text: t,
        link: links[i] || '#'
    }));

    await Header.findOneAndUpdate(
        {},
        {
            $set: {
                shopName,
                searchPlaceholder,
                showCart: showCart === 'on',
                menu
            }
        },
        { upsert: true, new: true }
    );

    req.flash("success", "✅ Đã lưu Header thành công!");
    res.redirect('/admin/header');
});



router.get('/footer', async (req, res) => {
    const footer = await Footer.findOne().lean();
    res.render('admin/footer/edit', { footer });
});

router.post('/footer/save', async (req, res) => {
    await Footer.findOneAndUpdate({}, req.body, { upsert: true });
    req.flash("success", "✅ Đã cập nhật Footer!");
    res.redirect('/admin/footer');
});

module.exports = router;