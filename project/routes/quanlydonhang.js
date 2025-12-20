const express = require('express');
const router = express.Router();
const DonHang = require('../models/DonHang');

/* ===== LIST ===== */
router.get('/', async (req, res) => {
    const orders = await DonHang.find().sort({ createdAt: -1 });

    res.render('admin/quanlydonhang/quanlydonhang', {
        orders
    });
});

/* ===== EDIT PAGE ===== */
router.get('/edit/:id', async (req, res) => {
    const order = await DonHang.findById(req.params.id);

    res.render('admin/quanlydonhang/edit', {
        order
    });
});

/* ===== UPDATE ===== */
router.post('/edit/:id', async (req, res) => {
    const { status } = req.body;

    await DonHang.findByIdAndUpdate(req.params.id, {
        status
    });

    res.redirect('/admin/quanlydonhang');
});

/* ===== DELETE ===== */
router.get('/delete/:id', async (req, res) => {
    await DonHang.findByIdAndDelete(req.params.id);
    res.redirect('/admin/quanlydonhang');
});

module.exports = router;
