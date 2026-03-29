const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const adminRoutes = require('../modules/admin/admin.routes');
const clinicRoutes = require('../modules/clinic/clinic.routes');
const doctorRoutes = require('../modules/doctor/doctor.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/clinics', clinicRoutes);
router.use('/doctors', doctorRoutes);

module.exports = router;
