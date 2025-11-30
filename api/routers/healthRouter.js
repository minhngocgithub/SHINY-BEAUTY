const express = require('express');
const router = express.Router();
const healthController = require('../controller/healthController');

// Health check endpoints
router.get('/health', healthController.healthCheck);
router.get('/ready', healthController.readinessCheck);
router.get('/live', healthController.livenessCheck);

module.exports = router;
