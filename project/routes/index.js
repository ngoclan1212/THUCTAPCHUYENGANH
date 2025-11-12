var express = require('express');
var router = express.Router();
router.all('/*', function(req,
                          res, next) {
    res.app.locals.layout='home';
    next();
})
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home/index', { title: 'Express' });
});

router.get('/pages', function(req, res, next) {
    res.render('layouts/pages', { title: 'Trang' });
});

router.get('/shop', function(req, res, next) {
    res.render('home/shop', { title: 'Cửa hàng' });
});

router.get('/contact', function(req, res, next) {
    res.render('layouts/contact', { title: 'Liên Hệ' });
});

router.get('/login', function(req, res, next) {
    res.render('layouts/login', { title: 'Login N&Wool Flowers' });
});

router.get('/forget', function(req, res, next) {
    res.render('layouts/forget', { title: 'Forget N&Wool Flowers' });
});

router.get('/sign', function(req, res, next) {
    res.render('layouts/sign', { title: 'Forget N&Wool Flowers' });
});

router.get('/customer', function(req, res, next) {
    res.render('layouts/customer', { title: 'Forget N&Wool Flowers' });
});

module.exports = router;
