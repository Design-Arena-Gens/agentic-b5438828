const express = require('express');
const { getMe, updateMe, listDoctors, listPatients, getDashboardStats } = require('../controllers/userController');
const { allowRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/me', getMe);
router.put('/me', updateMe);

router.get('/doctors', listDoctors);
router.get('/patients', allowRoles('doctor', 'admin'), listPatients);
router.get('/admin/stats', allowRoles('admin'), getDashboardStats);

module.exports = router;

