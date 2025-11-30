var createError = require('http-errors');
var express = require('express');
const { engine } = require('express-handlebars');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
app.engine(
    'hbs',
    engine( {
        extname: '.hbs',
        defaultLayout: 'layouts',
        partialsDir: path.join(__dirname, 'views', 'partials'),
        layoutsDir: path.join(__dirname, 'views', 'layouts')
    })
);
const session = require('express-session');

// Middleware session
app.use(session({
    secret: 'secret_key_for_session', // đổi thành gì đó bảo mật
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 giờ
}));
var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
//var shopRouter = require('./routes/shop');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');
const bcryptjs = require('bcryptjs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://127.0.0.1/node')
    .then(()=>{
        console.log("MongoDB connected successfully!");
    })
    .catch(err => {
        console.error("Error connecting to MongDB:", err);
    });

app.post('/login', (req, res) => {
    User.findOne({email: req.body.email}).then((user) => {
        if (user) {
            bcryptjs.compare(req.body.password,user.password,(err,matched)=>{
                if(err) return err;
                if(matched){
                    //res.send("User was logged in");
                    req.session.user =
                        {
                            id:user._id,
                            email:user.email,
                        };
                    res.redirect('/');
                }else {
                    res.send("Email hoac mat khau khong dung");
                }
            });
        }else{
            res.send("User khong ton tai");
        }
    })
});


app.post('/register',  (req,res) => {
        console.log(req.body);
        const newUser = new User();
        newUser.email = req.body.email;
        newUser.password = req.body.password;
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
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);



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
