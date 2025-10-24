const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { connectDB } = require('../utils/connect');
const { sanitizeUser } = require('./authController');

async function getMe(req, res) {
  try {
    await connectDB();
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateMe(req, res) {
  try {
    await connectDB();
    const allowed = [
      'name',
      'phone',
      'address',
      'gender',
      'dateOfBirth',
      'medicalHistory',
      'specialization',
      'bio',
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function listDoctors(req, res) {
  try {
    await connectDB();
    const doctors = await User.find({ role: 'doctor' })
      .select('name email specialization bio phone')
      .sort('name');
    res.json(
      doctors.map((doctor) => ({
        id: doctor._id?.toString(),
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        bio: doctor.bio,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function listPatients(req, res) {
  try {
    await connectDB();
    const patients = await User.find({ role: 'patient' })
      .select('name email phone dateOfBirth medicalHistory address gender')
      .sort('name');
    res.json(
      patients.map((patient) => ({
        id: patient._id?.toString(),
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        medicalHistory: patient.medicalHistory,
        address: patient.address,
        gender: patient.gender,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getDashboardStats(req, res) {
  try {
    await connectDB();
    const [patientCount, doctorCount, upcomingAppointments] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments({ scheduledAt: { $gte: new Date() } }),
    ]);

    const latestRecords = await MedicalRecord.find()
      .populate('patient', 'name')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      patientCount,
      doctorCount,
      upcomingAppointments,
      latestRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getMe,
  updateMe,
  listDoctors,
  listPatients,
  getDashboardStats,
};
