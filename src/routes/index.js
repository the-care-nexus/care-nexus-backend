const express = require('express');
const adminRoutes = require('../modules/admin/admin.routes');

const router = express.Router();

router.use('/admin', adminRoutes);

module.exports = router;
