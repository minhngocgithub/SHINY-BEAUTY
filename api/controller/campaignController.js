const Campaign = require('../models/campaign.models');
const CampaignService = require('../services/campaign.service');
const { queueCampaign, getQueueStats } = require('../jobs/campaignJobs');
const logger = require('../config/logger');

exports.createCampaign = async (req, res) => {
    try {
        const {
            name,
            type,
            category,
            subject,
            emailTemplate,
            emailContent,
            notificationTitle,
            notificationMessage,
            notificationType,
            actionUrl,
            targetSegment,
            segmentFilters,
            scheduledAt,
            sendImmediately,
            priority,
            batchSize,
            rateLimitPerHour
        } = req.body;

        // Create campaign
        const campaign = new Campaign({
            name,
            type,
            category,
            subject,
            emailTemplate,
            emailContent,
            notificationTitle,
            notificationMessage,
            notificationType,
            actionUrl,
            targetSegment,
            segmentFilters,
            scheduledAt,
            sendImmediately,
            createdBy: req.user._id,
            priority,
            batchSize,
            rateLimitPerHour
        });

        // Validate campaign
        const validation = await CampaignService.validateCampaign(campaign);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Campaign validation failed',
                errors: validation.errors
            });
        }

        // Set status
        if (sendImmediately) {
            campaign.status = 'SCHEDULED';
            campaign.scheduledAt = new Date();
        } else if (scheduledAt) {
            campaign.status = 'SCHEDULED';
        } else {
            campaign.status = 'DRAFT';
        }

        await campaign.save();

        // If send immediately, add to queue
        if (sendImmediately) {
            await queueCampaign(campaign._id);
            logger.info(`Campaign ${campaign._id} queued for immediate sending`);
        }

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            data: campaign,
            estimatedReach: validation.estimatedReach
        });

    } catch (error) {
        logger.error('Create campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create campaign',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/v1/campaigns
 * @desc    Get all campaigns (with filters)
 * @access  Admin
 */
exports.getCampaigns = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            category,
            type,
            dateFrom,
            dateTo
        } = req.query;

        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (type) query.type = type;

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const campaigns = await Campaign.find(query)
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Campaign.countDocuments(query);

        res.json({
            success: true,
            data: campaigns,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        logger.error('Get campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/v1/campaigns/:id
 * @desc    Get campaign by ID
 * @access  Admin
 */
exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('createdBy', 'fullName email');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.json({
            success: true,
            data: campaign
        });

    } catch (error) {
        logger.error('Get campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/v1/campaigns/:id
 * @desc    Update campaign
 * @access  Admin
 */
exports.updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Can only update if status is DRAFT
        if (campaign.status !== 'DRAFT') {
            return res.status(400).json({
                success: false,
                message: 'Can only update campaigns in DRAFT status'
            });
        }

        // Update fields
        const allowedFields = [
            'name', 'type', 'category', 'subject', 'emailTemplate',
            'emailContent', 'notificationTitle', 'notificationMessage',
            'notificationType', 'actionUrl', 'targetSegment', 'segmentFilters',
            'scheduledAt', 'priority', 'batchSize', 'rateLimitPerHour'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                campaign[field] = req.body[field];
            }
        });

        // Validate
        const validation = await CampaignService.validateCampaign(campaign);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        await campaign.save();

        res.json({
            success: true,
            message: 'Campaign updated successfully',
            data: campaign
        });

    } catch (error) {
        logger.error('Update campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update campaign',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/v1/campaigns/:id
 * @desc    Delete campaign
 * @access  Admin
 */
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Can only delete DRAFT or FAILED campaigns
        if (!['DRAFT', 'FAILED'].includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: 'Can only delete campaigns in DRAFT or FAILED status'
            });
        }

        await campaign.deleteOne();

        res.json({
            success: true,
            message: 'Campaign deleted successfully'
        });

    } catch (error) {
        logger.error('Delete campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete campaign',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/v1/campaigns/:id/send
 * @desc    Send campaign immediately
 * @access  Admin
 */
exports.sendCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Can only send DRAFT or SCHEDULED campaigns
        if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
            return res.status(400).json({
                success: false,
                message: 'Campaign cannot be sent'
            });
        }

        // Validate
        const validation = await CampaignService.validateCampaign(campaign);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Update status
        campaign.status = 'SCHEDULED';
        campaign.scheduledAt = new Date();
        await campaign.save();

        // Add to queue
        await queueCampaign(campaign._id);

        logger.info(`Campaign ${campaign._id} queued for sending by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Campaign queued for sending',
            data: campaign
        });

    } catch (error) {
        logger.error('Send campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send campaign',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/v1/campaigns/:id/cancel
 * @desc    Cancel campaign
 * @access  Admin
 */
exports.cancelCampaign = async (req, res) => {
    try {
        const { reason } = req.body;

        const campaign = await CampaignService.cancelCampaign(
            req.params.id,
            reason || 'Cancelled by admin'
        );

        res.json({
            success: true,
            message: 'Campaign cancelled',
            data: campaign
        });

    } catch (error) {
        logger.error('Cancel campaign error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @route   GET /api/v1/campaigns/:id/stats
 * @desc    Get campaign statistics
 * @access  Admin
 */
exports.getCampaignStats = async (req, res) => {
    try {
        const stats = await CampaignService.getCampaignStats(req.params.id);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        logger.error('Get campaign stats error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @route   POST /api/v1/campaigns/estimate
 * @desc    Estimate campaign reach
 * @access  Admin
 */
exports.estimateCampaignReach = async (req, res) => {
    try {
        const { targetSegment, segmentFilters } = req.body;

        const reach = await CampaignService.estimateCampaignReach({
            targetSegment,
            segmentFilters
        });

        res.json({
            success: true,
            data: {
                estimatedReach: reach,
                targetSegment,
                segmentFilters
            }
        });

    } catch (error) {
        logger.error('Estimate reach error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to estimate reach',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/v1/campaigns/summary
 * @desc    Get campaigns summary
 * @access  Admin
 */
exports.getCampaignsSummary = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            category: req.query.category,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        };

        const summary = await CampaignService.getCampaignsSummary(filters);

        res.json({
            success: true,
            data: summary
        });

    } catch (error) {
        logger.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get summary',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/v1/campaigns/queue/stats
 * @desc    Get queue statistics
 * @access  Admin
 */
exports.getQueueStats = async (req, res) => {
    try {
        const stats = await getQueueStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        logger.error('Get queue stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get queue stats',
            error: error.message
        });
    }
};