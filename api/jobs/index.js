const cron = require('node-cron');
const productJobs = require('./productJobs');
const uploadCleanupJobs = require('./uploadCleanupJobs');
const saleProgramJobs = require('./saleProgramJobs');
const reviewJobs = require('./reviewJobs');
const orderJobs = require('./orderJobs');
const campaignJobs = require('./campaignJobs');

const initializeCronJobs = () => {
    console.log('🚀 Initializing cron jobs...');

    productJobs.initProductMaintenanceJob();
    productJobs.initAutoPromotionJob();
    productJobs.initTrendingScoreUpdateJob();
    productJobs.initMonthlyCleanupJob();

    uploadCleanupJobs.initDailyCleanupJob();
    uploadCleanupJobs.initSixHourlyCleanupJob();

    saleProgramJobs.initSaleProgramMaintenanceJob();
    saleProgramJobs.initWeeklySaleProgramCleanupJob();

    reviewJobs.initAutoPublishReviewsJob();
    reviewJobs.initUpdateProductRatingsJob();
    reviewJobs.initCleanupFlaggedReviewsJob();
    reviewJobs.initArchiveOldReviewsJob();
    reviewJobs.initCacheTestimonialsJob();

    // Order automation jobs
    orderJobs.initAutoOrderStatusUpdateJob();
    orderJobs.initOverdueDeliveryCheckJob();
    orderJobs.initTrackingUpdateJob();
    orderJobs.initDeliveryReminderJob();

    // Campaign jobs - Bull Queue workers are auto-initialized on require
    console.log('📧 Campaign queue workers initialized');

    console.log('✅ All cron jobs initialized successfully');
};

module.exports = { initializeCronJobs };