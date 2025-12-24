var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Category = require('../models/category');
const DonHang = require('../models/DonHang');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
router.all('/*', function(req,
                          res, next) {
    res.app.locals.layout='home';
    next();
})
router.get('/', async function(req, res, next) {
    try {
        // Thêm .lean() vào cuối mỗi truy vấn find
        const bohoa = await Category.find({ category: 'bohoa' }).lean();
        const giohoa = await Category.find({ category: 'giohoa' }).lean();
        const top = await Category.find({ category: 'top' }).lean();

        // Kiểm tra log xem dữ liệu có lấy được từ DB không
        console.log("Số lượng Bó hoa:", bohoa.length);
        console.log("Số lượng Giỏ hoa:", giohoa.length);

        res.render('home/index', {
            bohoa: bohoa,
            giohoa: giohoa,
            top: top
        });
    } catch (err) {
        console.error("Lỗi lấy dữ liệu Home:", err);
        next(err);
    }
});


router.get('/pages', function(req, res, next) {
    res.render('layouts/pages', { title: 'Trang' });
});

router.get('/shop', async (req, res) => {
    try {
        // Sử dụng Category (model bạn đang dùng chung cho sản phẩm)
        // Dùng .lean() để Handlebars có thể đọc dữ liệu dễ dàng
        const bohoa = await Category.find({ category: 'bohoa' }).lean();
        const giohoa = await Category.find({ category: 'giohoa' }).lean();
        const topbanchay = await Category.find({ category: 'top' }).lean();
        // Log ra terminal để kiểm tra dữ liệu
        console.log("Shop - Bó hoa:", bohoa.length);
        console.log("Shop - Giỏ hoa:", giohoa.length);

        res.render('home/shop', {
            bohoa: bohoa,
            giohoa: giohoa,
            top: topbanchay
        });
    } catch (err) {
        console.error("Lỗi chi tiết tại Shop:", err);
        res.status(500).send("Lỗi tải dữ liệu shop: " + err.message);
    }
});

router.get('/contact', function(req, res, next) {
    res.render('layouts/contact', { title: 'Liên Hệ' });
});

//APP LOGIN
passport.use(new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
    User.findOne({email: email}).then(user => {
        if (!user)
            return done(null, false, {message: 'User not found'});

        bcryptjs.compare(password, user.password, (err, matched) => {
            if (err) return err;
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Wrong email or password'});
            }
        });

    });
}));

router.get('/login', function(req, res, next) {
    res.render('layouts/login', { title: 'Login N&Wool Flowers' });
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, () => {
        // Lưu user vào session để header nhận được user
        req.app.locals.user = req.user;

        res.redirect('/');   // Sau khi login → về trang chủ
    });
});
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user); // Pass the user to the done callback
    } catch (err) {
        done(err); // Pass the error to the done callback if an error occurred
    }
});
router.get('/forget', function(req, res, next) {
    res.render('layouts/forget', { title: 'Forget N&Wool Flowers' });
});

router.get('/sign', function(req, res, next) {
    res.render('layouts/sign', { title: 'Sign N&Wool Flowers' });
});
router.post('/sign', function(req, res, next) {
    let errors = [];
    if (!req.body.firstName) {
        errors.push({message: 'First name is required 1'});
    }
    if (!req.body.lastName) {
        errors.push({message: 'Last name is required'});
    }
    if (!req.body.email) {
        errors.push({message: 'E-mail is required'});
    }
    if (!req.body.password) {
        errors.push({message: 'Password is required'});
    }

    if (errors.length > 0) {
        res.render('layouts/sign', {
            title: 'Signup',
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        });
    } else {
        User.findOne({email: req.body.email}).then((user) => {
            if (!user) {
                const newUser = new User({
                    email: req.body.email,
                    password: req.body.password,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                });
                bcryptjs.genSalt(10, function (err, salt) {
                    bcryptjs.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save().then(saveUser => {
                            req.flash('success_message', 'Successfully registered!');
                            res.redirect('/login');//or /login
                        });
                    })
                })
            } else {
                req.flash('error_message', 'E-mail is exist!');
                res.redirect('/sign');
            }

        });

    }
});

router.get('/giohang', function(req, res, next) {
    res.render('layouts/giohang', { title: 'Giỏ Hàng N&Wool Flowers' });
});

router.get('/thanhtoan', function(req, res, next) {
    res.render('layouts/thanhtoan', { title: 'Thanh Toán N&Wool Flowers' });
});
// Tìm đến đoạn router.post('/thanhtoan', ...)
router.post('/thanhtoan', async (req, res) => {
    try {
        const { user, items, total } = req.body;

        // Gom dữ liệu vào object buyer đúng cấu trúc Schema
        const buyer = {
            name: user.name || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Khách vãng lai'),
            phone: user.phone || '',
            address: user.address || '',
            // Lấy email từ người dùng đang đăng nhập hoặc từ form
            email: (req.user && req.user.email) ? req.user.email : (user.email || 'guest@example.com')
        };

        const formattedItems = items.map(it => ({
            name: it.name || 'Sản phẩm',
            qty: Number(it.qty || 1),
            price: Number(it.price || 0),
            img: it.img || ''
        }));

        const newOrder = new DonHang({
            user: buyer, // Lưu cả Object buyer vào trường user
            items: formattedItems,
            total: Number(total),
            status: 'pending'
        });

        await newOrder.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/thongtin/:id', async (req, res) => {
    try {
        // Tìm hoa trong bảng Category bằng ID
        const hoa = await Category.findById(req.params.id).lean();

        if (!hoa) {
            return res.status(404).send("Không tìm thấy mẫu hoa này");
        }

        // Truyền dữ liệu sang thongtin.hbs
        res.render('layouts/thongtin', {
            title: hoa.name,
            product: hoa // Truyền nguyên object hoa vào biến 'product'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
});
module.exports = router;