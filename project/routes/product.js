const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/category');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    next();
});
router.get('/', async (req, res) => {
    const productsRaw = await Product.find({}).populate('category').lean();
    const products = productsRaw.map((p, index) => ({
        ...p,
        stt: index + 1
    }));
    res.render('admin/product/index', { products });
});

// Trang giao diện Thêm sản phẩm
router.get('/create', async (req, res) => {
    const categories = await Category.find({}).lean(); // Lấy danh mục để chọn khi thêm hoa
    res.render('admin/product/create', { categories });
});

// Xử lý lưu sản phẩm mới
router.post('/create', async (req, res) => {
    const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        image: req.body.image,
        category: req.body.category, // ID danh mục chọn từ dropdown
        status: req.body.status === 'true'
    });
    await newProduct.save();
    res.redirect('/admin/product');
});

module.exports = router;