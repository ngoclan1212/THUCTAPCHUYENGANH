const express = require('express');
const router = express.Router();
const LoaiHoa = require('../models/LoaiHoa');

/* =======================
   LIST
======================= */
router.get('/', async (req, res) => {
    const categories = await LoaiHoa
        .find()
        .sort({ createdAt: -1 })
        .lean(); // 🔥 BẮT BUỘC

    res.render('admin/quanlyloaihoa/qlyloaihoa', {
        title: 'Quản lý loại hoa',
        categories
    });
});

/* =======================
   CREATE
======================= */
router.get('/create', (req, res) => {
    res.render('admin/quanlyloaihoa/create', {
        title: 'Thêm loại hoa'
    });
});

router.post('/create', async (req, res) => {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
        return res.redirect('/admin/quanlyloaihoa/create');
    }

    await LoaiHoa.create({
        name: name.trim(),
        description
    });

    res.redirect('/admin/quanlyloaihoa');
});

/* =======================
   EDIT
======================= */
router.get('/edit/:id', async (req, res) => {
    const category = await LoaiHoa
        .findById(req.params.id)
        .lean(); // 🔥 BẮT BUỘC

    if (!category) {
        return res.redirect('/admin/quanlyloaihoa');
    }

    res.render('admin/quanlyloaihoa/edit', {
        title: 'Sửa loại hoa',
        category
    });
});

router.put('/edit/:id', async (req, res) => {
    const { name, description } = req.body;

    await LoaiHoa.findByIdAndUpdate(req.params.id, {
        name: name.trim(),
        description
    });

    res.redirect('/admin/quanlyloaihoa');
});

/* =======================
   DELETE
======================= */
router.delete('/:id', async (req, res) => {
    await LoaiHoa.findByIdAndDelete(req.params.id);
    res.redirect('/admin/quanlyloaihoa');
});

module.exports = router;
