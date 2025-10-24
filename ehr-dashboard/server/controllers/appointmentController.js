const dayjs = require('dayjs');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { connectDB } = require('../utils/connect');

async function createAppointment(req, res) {
  try {
    await connectDB();
    const { doctorId, scheduledAt, reason } = req.body;

    if (!doctorId || !scheduledAt) {
      return res.status(400).json({ message: 'Doctor and schedule are required' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    const scheduledDate = dayjs(scheduledAt);
    if (!scheduledDate.isValid() || scheduledDate.isBefore(dayjs())) {
      return res.status(400).json({ message: 'Invalid appointment date' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      scheduledAt: scheduledDate.toDate(),
      reason,
    });

    const populated = await appointment.populate([
      { path: 'doctor', select: 'name specialization email phone' },
      { path: 'patient', select: 'name email phone' },
    ]);

    res.status(201).json(normalizeAppointment(populated));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create appointment' });
  }
}

async function listAppointments(req, res) {
  try {
    await connectDB();
    const { role, _id } = req.user;
    const query = {};
    if (role === 'patient') {
      query.patient = _id;
    } else if (role === 'doctor') {
      query.doctor = _id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone gender dateOfBirth')
      .populate('doctor', 'name email specialization phone')
      .sort({ scheduledAt: 1 });

    res.json(appointments.map(normalizeAppointment));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateAppointmentStatus(req, res) {
  try {
    await connectDB();
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (['doctor', 'admin'].includes(req.user.role) === false) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot modify appointments of other doctors' });
    }

    if (status) {
      appointment.status = status;
    }
    if (notes) {
      appointment.notes = notes;
    }

    await appointment.save();

    const populated = await appointment.populate([
      { path: 'doctor', select: 'name email specialization phone' },
      { path: 'patient', select: 'name email phone' },
    ]);
    res.json(normalizeAppointment(populated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

function normalizeAppointment(document) {
  const obj = document.toObject({ virtuals: true });
  return {
    _id: obj._id?.toString(),
    patient: normalizeUser(obj.patient),
    doctor: normalizeUser(obj.doctor),
    scheduledAt: obj.scheduledAt instanceof Date ? obj.scheduledAt.toISOString() : obj.scheduledAt,
    status: obj.status,
    reason: obj.reason,
    notes: obj.notes,
    createdAt: obj.createdAt instanceof Date ? obj.createdAt.toISOString() : obj.createdAt,
    updatedAt: obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : obj.updatedAt,
  };
}

function normalizeUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject({ virtuals: true }) : user;
  return {
    id: obj._id?.toString ? obj._id.toString() : obj.id,
    name: obj.name,
    email: obj.email,
    phone: obj.phone,
    specialization: obj.specialization,
    gender: obj.gender,
    dateOfBirth: obj.dateOfBirth,
    medicalHistory: obj.medicalHistory,
  };
}

module.exports = { createAppointment, listAppointments, updateAppointmentStatus };
