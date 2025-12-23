const express = require('express');
const router = express.Router();
const DonHang = require('../models/DonHang'); // Nhớ viết hoa chữ D cho đúng file

// DANH SÁCH ĐƠN HÀNG
router.get('/', async (req, res) => {
    try {
        const status = req.query.status || '';
        let filter = {};
        if (status) filter.status = status;

        const orders = await DonHang.find(filter).sort({ createdAt: -1 }).lean();

        const stats = {
            total: await DonHang.countDocuments(),
            pendingCount: await DonHang.countDocuments({ status: 'pending' }),
            completedCount: await DonHang.countDocuments({ status: 'completed' }),
            cancelledCount: await DonHang.countDocuments({ status: 'cancelled' })
        };

        res.render('admin/quanlydonhang/quanlydonhang', {
            layout: 'admin',
            orders,
            stats,
            currentFilter: { status }
        });
    } catch (err) {
        res.status(500).send('Lỗi tải đơn hàng');
    }
});

// XỬ LÝ CẬP NHẬT TRẠNG THÁI (Dùng cho cả nút bấm nhanh và form edit)
router.post('/edit/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await DonHang.findByIdAndUpdate(req.params.id, { status });
        res.redirect('/admin/quanlydonhang');
    } catch (err) {
        res.send('Cập nhật thất bại');
    }
});

// XÓA ĐƠN HÀNG
router.post('/delete/:id', async (req, res) => {
    try {
        await DonHang.findByIdAndDelete(req.params.id);
        res.redirect('/admin/quanlydonhang');
    } catch (err) {
        res.send('Xóa thất bại');
    }
});

// EDIT FORM
router.get('/edit/:id', async (req, res) => {
    try {
        const order = await DonHang.findById(req.params.id).lean();
        res.render('admin/quanlydonhang/edit', { layout: 'admin', order });
    } catch (err) {
        res.send('Không tìm thấy đơn hàng');
    }
});

module.exports = router;