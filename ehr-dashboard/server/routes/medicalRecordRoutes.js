const express = require('express');
const { createRecord, listRecords } = require('../controllers/medicalRecordController');
const { allowRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', listRecords);
router.post('/', allowRoles('doctor', 'admin'), createRecord);

module.exports = router;

