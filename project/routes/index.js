var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home/index', { title: 'Express' });
});

router.get('/pages', function(req, res, next) {
    res.render('pages');
});

router.get('/shop', function(req, res, next) {
    res.render('shop');
});

router.get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Express' });
});



module.exports = router;
