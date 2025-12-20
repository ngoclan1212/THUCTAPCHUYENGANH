const express = require('express');
const router = express.Router();
const KhachHang = require('../models/KhachHang');

/* =========================
   DANH SÁCH KHÁCH HÀNG
========================= */
router.get('/', async (req, res) => {
    const keyword = req.query.keyword || '';

    let condition = {};

    if (keyword) {
        condition = {
            $or: [
                { name: new RegExp(keyword, 'i') },
                { email: new RegExp(keyword, 'i') },
                { phone: new RegExp(keyword, 'i') }
            ]
        };
    }

    const users = await KhachHang.find(condition)
        .sort({ createdAt: -1 })
        .lean();

    const data = users.map((u, index) => ({
        ...u,
        stt: index + 1
    }));

    res.render('admin/khachhang/danhsachKH', {
        users: data,
        keyword
    });
});



/* =========================
   FORM CREATE
========================= */
router.get('/create', (req, res) => {
    res.render('admin/khachhang/create');
});

/* =========================
   XỬ LÝ CREATE
========================= */
router.post('/create', async (req, res) => {
    try {
        const { name, email, phone, isActive } = req.body;

        await KhachHang.create({
            name,
            email,
            phone,
            isActive: isActive === 'true'
        });

        // 🔥 QUAN TRỌNG
        res.redirect('/admin/khachhang');
    } catch (err) {
        console.log(err);
        res.send('Lỗi thêm khách hàng');
    }
});

/* =========================
   FORM EDIT
========================= */
router.get('/edit/:id', async (req, res) => {
    try {
        const user = await KhachHang.findById(req.params.id).lean();
        res.render('admin/khachhang/edit', { user });
    } catch (err) {
        console.log(err);
        res.send('Lỗi trang sửa');
    }
});

/* =========================
   XỬ LÝ EDIT
========================= */
router.put('/edit/:id', async (req, res) => {
    try {
        const { name, email, phone, isActive } = req.body;

        await KhachHang.findByIdAndUpdate(req.params.id, {
            name,
            email,
            phone,
            isActive: isActive === 'true'
        });

        res.redirect('/admin/khachhang');
    } catch (err) {
        console.log(err);
        res.send('Lỗi cập nhật');
    }
});

/* =========================
   DELETE
========================= */
router.get('/delete/:id', async (req, res) => {
    try {
        await KhachHang.findByIdAndDelete(req.params.id);
        res.redirect('/admin/khachhang');
    } catch (err) {
        console.log(err);
        res.send('Lỗi xoá');
    }
});

module.exports = router;
