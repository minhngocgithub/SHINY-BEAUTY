import axiosApiInstance from "../../utils/api"

const BASE_CAMPAIGN_API = "/campaigns"

/**
 * Campaign Service
 * API calls for campaign management
 */

/**
 * Get all campaigns with filters
 * @param {Object} params - Query parameters (page, limit, status, category, type, dateFrom, dateTo)
 */
export const getCampaigns = async (params = {}) => {
    return await axiosApiInstance.get(`${BASE_CAMPAIGN_API}`, { params })
}

/**
 * Get campaign by ID
 * @param {String} id - Campaign ID
 */
export const getCampaignById = async (id) => {
    return await axiosApiInstance.get(`${BASE_CAMPAIGN_API}/${id}`)
}

/**
 * Create new campaign
 * @param {Object} campaignData - Campaign data
 */
export const createCampaign = async (campaignData) => {
    return await axiosApiInstance.post(`${BASE_CAMPAIGN_API}`, campaignData)
}

/**
 * Update campaign
 * @param {String} id - Campaign ID
 * @param {Object} campaignData - Updated campaign data
 */
export const updateCampaign = async (id, campaignData) => {
    return await axiosApiInstance.put(`${BASE_CAMPAIGN_API}/${id}`, campaignData)
}

/**
 * Delete campaign
 * @param {String} id - Campaign ID
 */
export const deleteCampaign = async (id) => {
    return await axiosApiInstance.delete(`${BASE_CAMPAIGN_API}/${id}`)
}

/**
 * Send campaign immediately
 * @param {String} id - Campaign ID
 */
export const sendCampaign = async (id) => {
    return await axiosApiInstance.post(`${BASE_CAMPAIGN_API}/${id}/send`)
}

/**
 * Cancel campaign
 * @param {String} id - Campaign ID
 * @param {String} reason - Cancellation reason
 */
export const cancelCampaign = async (id, reason) => {
    return await axiosApiInstance.post(`${BASE_CAMPAIGN_API}/${id}/cancel`, { reason })
}

/**
 * Get campaign statistics
 * @param {String} id - Campaign ID
 */
export const getCampaignStats = async (id) => {
    return await axiosApiInstance.get(`${BASE_CAMPAIGN_API}/${id}/stats`)
}

/**
 * Estimate campaign reach
 * @param {Object} data - { targetSegment, segmentFilters }
 */
export const estimateCampaignReach = async (data) => {
    return await axiosApiInstance.post(`${BASE_CAMPAIGN_API}/estimate`, data)
}

/**
 * Get campaigns summary
 * @param {Object} params - Filter parameters
 */
export const getCampaignsSummary = async (params = {}) => {
    return await axiosApiInstance.get(`${BASE_CAMPAIGN_API}/summary`, { params })
}

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
    return await axiosApiInstance.get(`${BASE_CAMPAIGN_API}/queue/stats`)
}

export default {
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
}
