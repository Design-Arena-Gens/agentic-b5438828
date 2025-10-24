const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { connectDB } = require('../utils/connect');

async function createRecord(req, res) {
  try {
    await connectDB();
    const { patientId, title, description } = req.body;

    if (!patientId || !title) {
      return res.status(400).json({ message: 'Patient and title are required' });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ message: 'Invalid patient' });
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user._id,
      title,
      description,
    });

    const populated = await record.populate([
      { path: 'patient', select: 'name email medicalHistory' },
      { path: 'doctor', select: 'name email specialization' },
    ]);

    res.status(201).json(normalizeRecord(populated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function listRecords(req, res) {
  try {
    await connectDB();
    const query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name email medicalHistory')
      .populate('doctor', 'name email specialization')
      .sort({ recordedAt: -1 });

    res.json(records.map(normalizeRecord));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

function normalizeRecord(document) {
  const obj = document.toObject({ virtuals: true });
  return {
    _id: obj._id?.toString(),
    patient: normalizeUser(obj.patient),
    doctor: normalizeUser(obj.doctor),
    title: obj.title,
    description: obj.description,
    recordedAt: obj.recordedAt instanceof Date ? obj.recordedAt.toISOString() : obj.recordedAt,
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
    specialization: obj.specialization,
    medicalHistory: obj.medicalHistory,
  };
}

module.exports = { createRecord, listRecords };
