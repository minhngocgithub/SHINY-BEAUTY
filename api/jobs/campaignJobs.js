/**
 * Campaign Queue Worker
 * Xử lý gửi email/notification hàng loạt với Bull Queue
 * 
 * File: api/jobs/campaignWorker.js
 */

const Queue = require('bull');
const Campaign = require('../models/campaign.models');
const CampaignService = require('../services/campaign.service');
const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const emailTemplates = require('../templates/campaigns');

// Initialize Redis connection
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create campaign queue
const campaignQueue = new Queue('campaigns', REDIS_URL, {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 200      // Keep last 200 failed jobs
    }
});

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Process campaign job
 * Steps:
 * 1. Fetch target users (paginated)
 * 2. Break into batches
 * 3. Send batch jobs
 */
campaignQueue.process('send-campaign', async (job, done) => {
    const { campaignId } = job.data;

    try {
        logger.info(`[CampaignWorker] Processing campaign: ${campaignId}`);

        // Get campaign
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        // Mark as processing
        await campaign.markAsProcessing();

        // Get target users
        const targetUsers = await CampaignService.getTargetUsers(campaign);

        // Update target count
        campaign.stats.targetCount = targetUsers.length;
        await campaign.save();

        logger.info(`[CampaignWorker] Campaign ${campaignId}: Found ${targetUsers.length} users`);

        // Break into batches
        const batchSize = campaign.batchSize || 100;
        const batches = [];

        for (let i = 0; i < targetUsers.length; i += batchSize) {
            batches.push(targetUsers.slice(i, i + batchSize));
        }

        logger.info(`[CampaignWorker] Campaign ${campaignId}: Created ${batches.length} batches`);

        // Add batch jobs to queue
        const batchJobs = batches.map((batch, index) => ({
            name: 'send-batch',
            data: {
                campaignId,
                batch,
                batchNumber: index + 1,
                totalBatches: batches.length
            },
            opts: {
                delay: index * 1000 // Stagger batches by 1 second
            }
        }));

        await campaignQueue.addBulk(batchJobs);

        logger.info(`[CampaignWorker] Campaign ${campaignId}: ${batchJobs.length} batch jobs added`);

        done(null, {
            campaignId,
            targetCount: targetUsers.length,
            batchCount: batches.length
        });

    } catch (error) {
        logger.error(`[CampaignWorker] Campaign ${campaignId} error:`, error);

        // Mark campaign as failed
        const campaign = await Campaign.findById(campaignId);
        if (campaign) {
            campaign.status = 'FAILED';
            campaign.errorLog.push({
                error: error.message,
                timestamp: new Date()
            });
            await campaign.save();
        }

        done(error);
    }
});

/**
 * Process batch sending
 */
campaignQueue.process('send-batch', async (job, done) => {
    const { campaignId, batch, batchNumber, totalBatches } = job.data;

    try {
        logger.info(`[CampaignWorker] Processing batch ${batchNumber}/${totalBatches} for campaign ${campaignId}`);

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const results = {
            sent: 0,
            failed: 0,
            errors: []
        };

        // Send to each user in batch
        for (const user of batch) {
            try {
                // Check user preferences
                const shouldSendEmail = campaign.type === 'EMAIL' || campaign.type === 'BOTH';
                const shouldSendNotification = campaign.type === 'NOTIFICATION' || campaign.type === 'BOTH';

                // Send email
                if (shouldSendEmail && user.email) {
                    const emailSent = await sendEmail(campaign, user);
                    if (emailSent) {
                        results.sent++;
                    } else {
                        results.failed++;
                    }
                }

                // Send notification
                if (shouldSendNotification) {
                    await sendNotification(campaign, user);
                }

                // Update campaign stats
                await campaign.incrementSent();

            } catch (error) {
                logger.error(`[CampaignWorker] Error sending to user ${user._id}:`, error.message);
                results.failed++;
                results.errors.push({
                    userId: user._id,
                    error: error.message
                });

                await campaign.incrementFailed();
            }

            // Rate limiting delay (10ms per email = 100 emails/sec max)
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        logger.info(`[CampaignWorker] Batch ${batchNumber}/${totalBatches} completed: ${results.sent} sent, ${results.failed} failed`);

        // Check if this is the last batch
        if (batchNumber === totalBatches) {
            // Mark campaign as completed
            await campaign.markAsCompleted();
            logger.info(`[CampaignWorker] Campaign ${campaignId} completed`);
        }

        done(null, results);

    } catch (error) {
        logger.error(`[CampaignWorker] Batch ${batchNumber} error:`, error);
        done(error);
    }
});

/**
 * Send email to user
 */
async function sendEmail(campaign, user) {
    try {
        // Get email template
        const template = emailTemplates[`${campaign.emailTemplate}Template`];
        if (!template) {
            throw new Error(`Template ${campaign.emailTemplate} not found`);
        }

        // Prepare template data
        const templateData = {
            userName: user.fullName,
            ...campaign.emailContent
        };

        // Generate HTML
        const html = template(templateData);

        // Send email
        const mailOptions = {
            from: `"Shiny Beauty" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: campaign.subject,
            html: html.replace('{{unsubscribeUrl}}', `${process.env.FRONTEND_URL}/unsubscribe?user=${user._id}`)
        };

        await transporter.sendMail(mailOptions);

        logger.debug(`[CampaignWorker] Email sent to ${user.email}`);
        return true;

    } catch (error) {
        logger.error(`[CampaignWorker] Email send error for ${user.email}:`, error.message);
        return false;
    }
}

/**
 * Send notification to user
 */
async function sendNotification(campaign, user) {
    try {
        const io = global.io; // Socket.IO instance from app.js

        if (!io) {
            logger.warn('[CampaignWorker] Socket.IO not available');
            return;
        }

        const notificationData = {
            type: campaign.notificationType,
            title: campaign.notificationTitle,
            message: campaign.notificationMessage,
            actionUrl: campaign.actionUrl,
            priority: campaign.priority.toLowerCase(),
            data: {
                campaignId: campaign._id,
                category: campaign.category
            }
        };

        // Emit to user's socket room
        io.to(`user:${user._id}`).emit('notification:new', notificationData);

        // Store in Redis (notification service handles this)
        const NotificationService = require('../services/notification.service');
        await NotificationService.createNotification(user._id, notificationData);

        logger.debug(`[CampaignWorker] Notification sent to user ${user._id}`);

    } catch (error) {
        logger.error(`[CampaignWorker] Notification send error:`, error.message);
    }
}

/**
 * Queue event listeners
 */
campaignQueue.on('completed', (job, result) => {
    logger.info(`[CampaignQueue] Job ${job.id} completed:`, result);
});

campaignQueue.on('failed', (job, err) => {
    logger.error(`[CampaignQueue] Job ${job.id} failed:`, err.message);
});

campaignQueue.on('stalled', (job) => {
    logger.warn(`[CampaignQueue] Job ${job.id} stalled`);
});

/**
 * Scheduled job to process scheduled campaigns
 * Runs every minute
 */
setInterval(async () => {
    try {
        const scheduledCampaigns = await Campaign.getScheduledCampaigns();

        for (const campaign of scheduledCampaigns) {
            logger.info(`[CampaignScheduler] Triggering scheduled campaign: ${campaign._id}`);

            // Add to queue
            await campaignQueue.add('send-campaign', {
                campaignId: campaign._id
            });
        }
    } catch (error) {
        logger.error('[CampaignScheduler] Error processing scheduled campaigns:', error);
    }
}, 60000); // Every minute

/**
 * Health check endpoint
 */
campaignQueue.getJobCounts().then(counts => {
    logger.info('[CampaignQueue] Initialized. Current counts:', counts);
});

module.exports = {
    campaignQueue,

    /**
     * Add campaign to queue
     */
    async queueCampaign(campaignId) {
        return await campaignQueue.add('send-campaign', { campaignId });
    },

    /**
     * Get queue status
     */
    async getQueueStats() {
        const counts = await campaignQueue.getJobCounts();
        const workers = await campaignQueue.getWorkers();

        return {
            counts,
            workers: workers.length,
            isPaused: await campaignQueue.isPaused()
        };
    },

    /**
     * Pause queue
     */
    async pauseQueue() {
        await campaignQueue.pause();
        logger.info('[CampaignQueue] Paused');
    },

    /**
     * Resume queue
     */
    async resumeQueue() {
        await campaignQueue.resume();
        logger.info('[CampaignQueue] Resumed');
    },

    /**
     * Clean old jobs
     */
    async cleanQueue(grace = 86400000) {
        // Clean jobs older than grace period (default 24h)
        await campaignQueue.clean(grace, 'completed');
        await campaignQueue.clean(grace, 'failed');
        logger.info('[CampaignQueue] Cleaned old jobs');
    }
};