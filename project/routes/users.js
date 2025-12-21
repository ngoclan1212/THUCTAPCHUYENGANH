const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ==================
// LIST USER
// ==================
router.get('/', async (req, res) => {
    try {
        const users = await User.find().lean();
        res.render('admin/User/danhsachKH', {
            users
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi load danh sách user');
    }
});

// ==================
// CREATE FORM
// ==================
router.get('/create', (req, res) => {
    res.render('admin/User/create');
});

// ==================
// CREATE USER
// ==================
router.post('/create', async (req, res) => {
    try {
        const { firstName, lastName, email, password, isActive } = req.body;

        await User.create({
            firstName,
            lastName,
            email,
            password,
            isActive: isActive === 'true'
        });

        res.redirect('/admin/User');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/User/create');
    }
});

// ==================
// EDIT FORM
// ==================
router.get('/edit/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        res.render('admin/User/edit', { user });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/User');
    }
});

// ==================
// UPDATE USER
// ==================
router.put('/edit/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, password, isActive } = req.body;

        const updateData = {
            firstName,
            lastName,
            email,
            isActive: isActive === 'true'
        };

        // nếu có nhập password thì mới update
        if (password && password.trim() !== '') {
            updateData.password = password;
        }

        await User.findByIdAndUpdate(req.params.id, updateData);

        res.redirect('/admin/User');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/User');
    }
});

// ==================
// DELETE USER
// ==================
router.post('/delete/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin/User');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/User');
    }
});

module.exports = router;
