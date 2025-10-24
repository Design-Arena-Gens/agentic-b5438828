const express = require('express');
const { createAppointment, listAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { allowRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/', allowRoles('patient'), createAppointment);
router.get('/', listAppointments);
router.patch('/:id/status', allowRoles('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;

