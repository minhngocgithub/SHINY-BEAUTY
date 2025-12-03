import { defineStore } from 'pinia';
import {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    cancelCampaign,
    getCampaignStats,
    estimateCampaignReach,
    getCampaignsSummary,
    getQueueStats
} from '../../service/campaign.service';

/**
 * Campaign Store
 * Manages campaign data and operations
 */
export const useCampaignStore = defineStore('campaign', {
    state: () => ({
        // Campaigns list
        campaigns: [],
        currentCampaign: null,

        // Pagination
        currentPage: 1,
        totalPages: 1,
        totalCampaigns: 0,
        limit: 20,

        // Filters
        filters: {
            status: '',
            category: '',
            type: '',
            dateFrom: null,
            dateTo: null
        },

        // Summary stats
        summary: {
            total: 0,
            draft: 0,
            scheduled: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            totalSent: 0,
            totalDelivered: 0,
            avgOpenRate: 0,
            avgClickRate: 0
        },

        // Queue stats
        queueStats: {
            counts: {},
            workers: 0,
            isPaused: false
        },

        // UI state
        loading: false,
        saving: false,
        error: null
    }),

    getters: {
        /**
         * Get campaigns by status
         */
        campaignsByStatus: (state) => (status) => {
            return state.campaigns.filter(c => c.status === status);
        },

        /**
         * Get draft campaigns
         */
        draftCampaigns: (state) => {
            return state.campaigns.filter(c => c.status === 'DRAFT');
        },

        /**
         * Get scheduled campaigns
         */
        scheduledCampaigns: (state) => {
            return state.campaigns.filter(c => c.status === 'SCHEDULED');
        },

        /**
         * Get active campaigns
         */
        activeCampaigns: (state) => {
            return state.campaigns.filter(c => c.status === 'PROCESSING');
        },

        /**
         * Check if campaign is editable
         */
        isCampaignEditable: () => (campaign) => {
            return campaign?.status === 'DRAFT';
        },

        /**
         * Check if campaign can be sent
         */
        isCampaignSendable: () => (campaign) => {
            return ['DRAFT', 'SCHEDULED'].includes(campaign?.status);
        },

        /**
         * Check if campaign can be cancelled
         */
        isCampaignCancellable: () => (campaign) => {
            return ['SCHEDULED', 'PROCESSING'].includes(campaign?.status);
        }
    },

    actions: {
        /**
         * Fetch campaigns with filters
         */
        async fetchCampaigns(params = {}) {
            try {
                this.loading = true;
                this.error = null;

                const response = await getCampaigns({
                    page: this.currentPage,
                    limit: this.limit,
                    ...this.filters,
                    ...params
                });

                if (response.data.success) {
                    this.campaigns = response.data.data;
                    this.totalCampaigns = response.data.pagination.total;
                    this.totalPages = response.data.pagination.pages;
                    this.currentPage = response.data.pagination.page;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error('[CampaignStore] Fetch campaigns error:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Fetch campaign by ID
         */
        async fetchCampaignById(id) {
            try {
                this.loading = true;
                this.error = null;

                const response = await getCampaignById(id);

                if (response.data.success) {
                    this.currentCampaign = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error('[CampaignStore] Fetch campaign error:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Create new campaign
         */
        async create(campaignData) {
            try {
                this.saving = true;
                this.error = null;

                const response = await createCampaign(campaignData);

                if (response.data.success) {
                    this.campaigns.unshift(response.data.data);
                    this.currentCampaign = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error('[CampaignStore] Create campaign error:', error);
                throw error;
            } finally {
                this.saving = false;
            }
        },

        /**
         * Update campaign
         */
        async update(id, campaignData) {
            try {
                this.saving = true;
                this.error = null;

                const response = await updateCampaign(id, campaignData);

                if (response.data.success) {
                    const index = this.campaigns.findIndex(c => c._id === id);
                    if (index !== -1) {
                        this.campaigns[index] = response.data.data;
                    }
                    this.currentCampaign = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error('[CampaignStore] Update campaign error:', error);
                throw error;
            } finally {
                this.saving = false;
            }
        },

        /**
         * Delete campaign
         */
        async delete(id) {
            try {
                this.loading = true;
                this.error = null;

                const response = await deleteCampaign(id);

                if (response.data.success) {
                    this.campaigns = this.campaigns.filter(c => c._id !== id);
                    if (this.currentCampaign?._id === id) {
                        this.currentCampaign = null;
                    }
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error('[CampaignStore] Delete campaign error:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Send campaign immediately
         */
        async send(id) {
            try {
                this.loading = true;
                this.error = null;

                const response = await sendCampaign(id);

                if (response.data.success) {
                    const index = this.campaigns.findIndex(c => c._id === id);
                    if (index !== -1) {
                        this.campaigns[index] = response.data.data;
                    }
                    this.currentCampaign = response.data.data;
                    return response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error('[CampaignStore] Send campaign error:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Cancel campaign
         */
        async cancel(id, reason) {
            try {
                this.loading = true;
                this.error = null;

                const response = await cancelCampaign(id, reason);

                if (response.data.success) {
                    const index = this.campaigns.findIndex(c => c._id === id);
                    if (index !== -1) {
                        this.campaigns[index] = response.data.data;
                    }
                    this.currentCampaign = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error('[CampaignStore] Cancel campaign error:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Get campaign statistics
         */
        async fetchCampaignStats(id) {
            try {
                const response = await getCampaignStats(id);

                if (response.data.success && this.currentCampaign) {
                    this.currentCampaign.stats = response.data.data;
                }
                return response.data.data;
            } catch (error) {
                console.error('[CampaignStore] Fetch stats error:', error);
            }
        },

        /**
         * Estimate campaign reach
         */
        async estimateReach(data) {
            try {
                const response = await estimateCampaignReach(data);
                return response.data.data;
            } catch (error) {
                console.error('[CampaignStore] Estimate reach error:', error);
                throw error;
            }
        },

        /**
         * Fetch campaigns summary
         */
        async fetchSummary(params = {}) {
            try {
                const response = await getCampaignsSummary(params);

                if (response.data.success) {
                    this.summary = response.data.data;
                }
            } catch (error) {
                console.error('[CampaignStore] Fetch summary error:', error);
            }
        },

        /**
         * Fetch queue stats
         */
        async fetchQueueStats() {
            try {
                const response = await getQueueStats();

                if (response.data.success) {
                    this.queueStats = response.data.data;
                }
            } catch (error) {
                console.error('[CampaignStore] Fetch queue stats error:', error);
            }
        },

        /**
         * Set filters
         */
        setFilters(filters) {
            this.filters = { ...this.filters, ...filters };
            this.currentPage = 1;
            this.fetchCampaigns();
        },

        /**
         * Clear filters
         */
        clearFilters() {
            this.filters = {
                status: '',
                category: '',
                type: '',
                dateFrom: null,
                dateTo: null
            };
            this.currentPage = 1;
            this.fetchCampaigns();
        },

        /**
         * Set page
         */
        setPage(page) {
            this.currentPage = page;
            this.fetchCampaigns();
        },

        /**
         * Reset store
         */
        resetStore() {
            this.campaigns = [];
            this.currentCampaign = null;
            this.currentPage = 1;
            this.totalPages = 1;
            this.totalCampaigns = 0;
            this.filters = {
                status: '',
                category: '',
                type: '',
                dateFrom: null,
                dateTo: null
            };
            this.summary = {
                total: 0,
                draft: 0,
                scheduled: 0,
                processing: 0,
                completed: 0,
                failed: 0,
                totalSent: 0,
                totalDelivered: 0,
                avgOpenRate: 0,
                avgClickRate: 0
            };
            this.loading = false;
            this.saving = false;
            this.error = null;
        }
    }
});
