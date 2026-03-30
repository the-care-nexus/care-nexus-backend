const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const adminRoutes = require('../modules/admin/admin.routes');
const clinicRoutes = require('../modules/clinic/clinic.routes');
const doctorRoutes = require('../modules/doctor/doctor.routes');
const patientRoutes = require('../modules/patient/patient.routes');
const systemRoutes = require('../modules/system/system.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/clinics', clinicRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/system', systemRoutes);

module.exports = router;
