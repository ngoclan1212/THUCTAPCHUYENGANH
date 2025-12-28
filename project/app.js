    var createError = require('http-errors');
    var express = require('express');
    const { engine } = require('express-handlebars');
    const methodOverride = require('method-override');
    const session = require('express-session');
    const flash = require('connect-flash');
    const passport = require('passport');
    var app = express();
    var path = require('path');

    app.use('/img', express.static(path.join(__dirname, 'img')));

    var cookieParser = require('cookie-parser');
    var logger = require('morgan');
    app.engine(
        'hbs',
        engine( {
            extname: '.hbs',

            defaultLayout: 'layouts',
            partialsDir: path.join(__dirname, 'views', 'partials'),
            layoutsDir: path.join(__dirname, 'views', 'layouts'),

            helpers: {
                // 1. So sánh bằng (dùng để hiển thị màu sắc trạng thái)
                eq: function (a, b) { return a === b; },

                // 2. Định dạng tiền: 1400000 -> 1.400.000
                formatCurrency: function (value) {
                    if (!value) return "0";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                },

                // 3. Định dạng ngày: Hiển thị Giờ:Phút Ngày/Tháng/Năm
                formatDate: function (date) {
                    if (!date) return "---";
                    return new Date(date).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                },

                // 4. Cắt ID: Lấy 6 ký tự cuối cho gọn giống ảnh mẫu
                sliceId: function (id) {
                    if (!id) return "N/A";
                    return id.toString().slice(-6).toUpperCase();
                },
                range: function (from, to) {
                    let res = [];
                    for (let i = from; i <= to; i++) res.push(i);
                    return res;
                },

                lt: (a, b) => Number(a) < Number(b),
                gt: (a, b) => Number(a) > Number(b),
                inc: function(value) {
                    return parseInt(value) + 1;
                }
            }
        })
    );

    // Middleware session
    app.use(session({
        secret: 'secret_key_for_session', // đổi thành gì đó bảo mật
        resave: true,
        saveUninitialized: true,
        // cookie: { maxAge: 1000 * 60 * 60 } // 1 giờ
    }));
    //methor override
    app.use(methodOverride('_method'));
    app.use(flash());
    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        next();
    });
    //PASSPORT
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(async (req, res, next) => {
        try {
            const pageData = await Page.findOne().lean();
            res.locals.page = pageData || null;
            next();
        } catch (err) {
            console.error("❌ Lỗi load Page:", err);
            res.locals.page = null;
            next();
        }
    });
    app.use(async (req, res, next) => {
        try {
            const footer = await Footer.findOne().lean();
            res.locals.footer = footer || null;
            next();
        } catch (err) {
            console.error("❌ Lỗi load Footer:", err);
            res.locals.footer = null;
            next();
        }
    });

    //You might also need custom middleware to make flash messages available in templates
    app.use((req, res, next) => {
        // res.locals.user = req.user ? req.user.toObject() : null;
        res.locals.user = (req.user) ? req.user.toObject() : (req.session.user || null);
        res.locals.success_message = req.flash('success_message');
        res.locals.error_message = req.flash('error_message');
        res.locals.error = req.flash('error'); // Passport.js often uses 'error'
        res.locals.errors = req.flash('errors');
        next();
    });


    var quanlydonhangRouter = require('./routes/quanlydonhang');
    var indexRouter = require('./routes/index');
    var adminRouter = require('./routes/admin');
    var usersRouter = require('./routes/users');
    var categoryRouter = require('./routes/category');
    // var productRouter = require('./routes/product');

    console.log(path.join(__dirname, 'views', 'layouts'));
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));

    app.set('view engine', 'hbs');

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static('public'));

    app.use('/admin/quanlydonhang', quanlydonhangRouter);
    app.use('/', indexRouter);
    app.use('/admin', adminRouter);
    // app.use('/admin/product', productRouter);
    app.use('/admin/category', categoryRouter);
    app.use('/admin/user', usersRouter);          // canonical path used by views
    app.use('/admin/KhachHang', usersRouter);     // optional alias for legacy links
    app.get('/admin/KhachHang', (req, res) => res.redirect('/admin/user'));

    //var shopRouter = require('./routes/shop');
    const mongoose = require('mongoose');
    const bodyParser = require('body-parser');
    const {Strategy: LocalStrategy} = require("passport-local");
    const User = require('./models/User');

    passport.use(new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });

                if (!user) {
                    return done(null, false, { message: 'Sai email hoặc mật khẩu' });
                }

                // 🚫 USER BỊ KHÓA → CẤM LOGIN
                if (user.isActive === false) {
                    return done(null, false, { message: 'Tài khoản đã bị khóa' });
                }

                const match = await bcryptjs.compare(password, user.password);
                if (!match) {
                    return done(null, false, { message: 'Sai email hoặc mật khẩu' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

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

    const Contact = require('./models/Contact');
    const Page = require('./models/Page');
    const Footer = require('./models/Footer');
    const bcryptjs = require('bcryptjs');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://127.0.0.1/node')
        .then(()=>{
            console.log("MongoDB connected successfully!");
        })
        .catch(err => {
            console.error("Error connecting to MongDB:", err);
        });

    // Thay thế đoạn cũ trong app.js bằng đoạn này:
    Contact.findOne().then(async (contact) => {
        const defaultData = {
            description: "Chào mừng bạn đến với N&Fresh Flowers...",
            address: "180 Cao Lỗ, Phường 4, Quận 8, TP.HCM (STU)",
            hotline: "03 5932 9912",
            email: "ngoclan121204@gmail.com",
            workingHours: "08:00 - 21:00 (Hàng ngày)",
            googleMapsUrl: "https://maps.google.com/..."
        };

        if (!contact) {
            await Contact.create(defaultData);
            console.log("✅ Đã tạo mới dữ liệu Contact mẫu!");
        } else if (!contact.email) {
            // Nếu đã có dữ liệu nhưng thiếu email thì cập nhật thêm email vào
            await Contact.updateOne({}, { $set: { email: "ngoclan121204@gmail.com" } });
            console.log("✅ Đã cập nhật bổ sung Email vào Contact!");
        }
    });
    Page.findOne().then(page => {
        if (!page) {
            Page.create({
                pageTitle: "N&Fresh Flowers",
                mainDescription: "Hơi thở của thiên nhiên trong từng không gian sống",
                missionText:
                    "Chúng tôi tin rằng mỗi đóa hoa đều mang trong mình một linh hồn riêng, một thông điệp yêu thương cần được chuyển tải trọn vẹn.",

                bannerImg: "/img/banner11.png",

                imageLarge: "/img/9.jpg",
                imageSmall: "/img/8.jpg",

                values: [
                    {
                        icon: "bi bi-heart-fill",
                        title: "Tận tâm",
                        description: "Mỗi thiết kế là sự kết hợp giữa kỹ thuật và cảm xúc.",
                        isActive: false
                    },
                    {
                        icon: "bi bi-flower1",
                        title: "Tươi mới",
                        description: "Hoa nhập mới mỗi ngày, đảm bảo độ bền.",
                        isActive: true
                    },
                    {
                        icon: "bi bi-truck",
                        title: "Tốc độ",
                        description: "Giao hoa hỏa tốc trong 2 giờ.",
                        isActive: false
                    }
                ],

                creativeTitle: "Sáng tạo không giới hạn",
                creativeDescription:
                    "Luôn cập nhật xu hướng thiết kế hoa từ Châu Âu đến Hàn Quốc.",
                creativeImage: "/img/10.jpg"
            });

            console.log("✅ Đã seed Page CMS chuẩn");
        }
    });
    Footer.findOne().then(f => {
        if (!f) {
            Footer.create({
                shopName: "Shop Hoa Tươi Fresh Flowers",
                slogan: "Chẳng phải đợi lâu, bạn chỉ cần đặt hàng và hoa sẽ được giao tận nơi trong chưa đầy 1h.",
                address: "180 Cao Lỗ, Phường 4, Quận 8, TP.HCM",
                hotline: "03 5932 9912",
                email: "ngoclan121204@gmail.com",
                openHours: "08:00 - 21:00 (Daily)",

                support1: "Chính Sách Trả Hàng",
                support2: "Chính Sách Bảo Hành",
                support3: "Chính Sách Mua Hàng",
                support4: "Chính Sách Người Dùng",

                tag1: "Shop Tươi Fresh Flowers",
                tag2: "N&Fresh Flowers",

                copyright: "2025 N&Fresh Flowers. All rights reserved."
            });
            console.log("✅ Đã seed Footer CMS");
        }
    });


    app.post('/register',  (req,res) => {
            console.log(req.body);
            const newUser = new User();
            newUser.email = req.body.email;
            newUser.password = req.body.password;
            newUser.firstName = req.body.firstName;
            newUser.lastName  = req.body.lastName;
            newUser.email     = req.body.email;
            newUser.password  = req.body.password;

        bcryptjs.genSalt(10, function (err, salt) {
                bcryptjs.hash(newUser.password, salt, function (err, hash) {
                    if (err) {return  err}
                    newUser.password = hash;

                    newUser.save().then(userSave=>
                    {
                        res.send('USER SAVED');
                    }).catch(err => {
                        res.send('USER ERROR'+err);
                    });
                });
            });
        }
    );

    app.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error(err);
                return res.redirect('/'); // nếu lỗi vẫn redirect về trang chính
            }
            // Xóa cookie session
            res.clearCookie('connect.sid');
            // Sau đó redirect về login
            res.redirect('/login');
        });
    });

    // view engine setup


    app.use((req, res, next) => {
        res.locals.user = req.session.user || null;
        next();
    });

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    module.exports = app;
