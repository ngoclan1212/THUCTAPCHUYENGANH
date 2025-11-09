var express = require('express');
var router = express.Router();

/* GET users listing. */
router.all('/*', function(req,
                          res, next) {
    res.app.locals.layout='admin';
    next();
})
router.get('/', function(req, res, next) {
    res.send('admin/index', { title: 'Admin'});
})
module.exports = router;
