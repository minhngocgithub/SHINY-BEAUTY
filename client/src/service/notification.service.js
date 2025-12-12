import axiosApiInstance from "../../utils/api"

export const getNotificationsApi = async (limit = 20) => {
    return await axiosApiInstance.get(`/notifications?limit=${limit}`);
};

export const markNotificationAsReadApi = async (notificationId) => {
    return await axiosApiInstance.patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsReadApi = async () => {
    return await axiosApiInstance.patch('/notifications/mark-all-read');
};

export const getNotificationPreferencesApi = async () => {
    return await axiosApiInstance.get('/notifications/preferences');
};

export const updateNotificationPreferencesApi = async (preferences) => {
    return await axiosApiInstance.put('/notifications/preferences', preferences);
};

export const deleteNotificationApi = async (notificationId) => {
    return await axiosApiInstance.delete(`/notifications/${notificationId}`);
};

export const clearAllNotificationsApi = async () => {
    return await axiosApiInstance.delete('/notifications/clear-all');
};
