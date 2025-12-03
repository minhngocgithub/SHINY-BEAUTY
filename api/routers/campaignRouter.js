const express = require('express');
const router = express.Router();
const campaignController = require('../controller/campaignController');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

// Campaign CRUD
router.post('/', authenticate, authorizeAdmin, campaignController.createCampaign);
router.get('/', authenticate, authorizeAdmin, campaignController.getCampaigns);
router.get('/summary', authenticate, authorizeAdmin, campaignController.getCampaignsSummary);
router.get('/:id', authenticate, authorizeAdmin, campaignController.getCampaignById);
router.put('/:id', authenticate, authorizeAdmin, campaignController.updateCampaign);
router.delete('/:id', authenticate, authorizeAdmin, campaignController.deleteCampaign);

// Campaign actions
router.post('/:id/send', authenticate, authorizeAdmin, campaignController.sendCampaign);
router.post('/:id/cancel', authenticate, authorizeAdmin, campaignController.cancelCampaign);
router.get('/:id/stats', authenticate, authorizeAdmin, campaignController.getCampaignStats);

// Utilities
router.post('/estimate', authenticate, authorizeAdmin, campaignController.estimateCampaignReach);
router.get('/queue/stats', authenticate, authorizeAdmin, campaignController.getQueueStats);

module.exports = router;