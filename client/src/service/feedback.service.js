import axiosApiInstance from "../../utils/api";

const BASE_FEEDBACK_API = '/feedback';

// ==================== API CALLS ====================

/**
 * Create new feedback
 * @param {Object} feedbackData - Feedback data
 * @returns {Promise}
 */
export const createFeedbackApi = async (feedbackData) => {
  return await axiosApiInstance.post(`${BASE_FEEDBACK_API}`, feedbackData);
};

/**
 * Get current user's feedbacks
 * @param {Object} params - Query parameters (page, limit, type, status)
 * @returns {Promise}
 */
export const getMyFeedbacksApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_FEEDBACK_API}/my`, { params });
};

/**
 * Get all feedbacks (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getAllFeedbacksApi = async (params = {}) => {
  return await axiosApiInstance.get(`${BASE_FEEDBACK_API}`, { params });
};

/**
 * Get single feedback by ID
 * @param {string} feedbackId - Feedback ID
 * @returns {Promise}
 */
export const getFeedbackByIdApi = async (feedbackId) => {
  return await axiosApiInstance.get(`${BASE_FEEDBACK_API}/${feedbackId}`);
};

/**
 * Reply to feedback (Admin only)
 * @param {string} feedbackId - Feedback ID
 * @param {Object} replyData - Reply data (message, internalNote)
 * @returns {Promise}
 */
export const replyToFeedbackApi = async (feedbackId, replyData) => {
  return await axiosApiInstance.post(`${BASE_FEEDBACK_API}/${feedbackId}/replies`, replyData);
};

/**
 * Update feedback status (Admin only)
 * @param {string} feedbackId - Feedback ID
 * @param {string} status - New status
 * @returns {Promise}
 */
export const updateFeedbackStatusApi = async (feedbackId, status) => {
  return await axiosApiInstance.patch(`${BASE_FEEDBACK_API}/${feedbackId}/status`, { status });
};

/**
 * Delete feedback (Admin only)
 * @param {string} feedbackId - Feedback ID
 * @returns {Promise}
 */
export const deleteFeedbackApi = async (feedbackId) => {
  return await axiosApiInstance.delete(`${BASE_FEEDBACK_API}/${feedbackId}`);
};

// ==================== CONSTANTS ====================

export const FEEDBACK_TYPES = {
  SUGGESTION: 'suggestion',
  BUG: 'bug',
  QUESTION: 'question',
  ORDER_ISSUE: 'order_issue',
  PAYMENT_PROBLEM: 'payment_problem',
  SHIPPING_DELAY: 'shipping_delay',
  PRODUCT_QUALITY: 'product_quality',
  TECHNICAL_ISSUE: 'technical_issue',
  ACCOUNT_ISSUE: 'account_issue',
  OTHER: 'other'
};

export const FEEDBACK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

export const FEEDBACK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// ==================== LABEL HELPERS ====================

export const getFeedbackTypeLabel = (type) => {
  const labels = {
    suggestion: 'Suggestion',
    bug: 'Bug Report',
    question: 'Question',
    order_issue: 'Order Issue',
    payment_problem: 'Payment Problem',
    shipping_delay: 'Shipping Delay',
    product_quality: 'Product Quality',
    technical_issue: 'Technical Issue',
    account_issue: 'Account Issue',
    other: 'Other'
  };
  return labels[type] || type;
};

export const getFeedbackStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  };
  return labels[status] || status;
};

export const getFeedbackPriorityLabel = (priority) => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };
  return labels[priority] || priority;
};

// ==================== COLOR HELPERS ====================

export const getFeedbackTypeColor = (type) => {
  const colors = {
    suggestion: 'blue',
    bug: 'red',
    question: 'yellow',
    order_issue: 'purple',
    payment_problem: 'red',
    shipping_delay: 'amber',
    product_quality: 'pink',
    technical_issue: 'indigo',
    account_issue: 'cyan',
    other: 'gray'
  };
  return colors[type] || 'gray';
};

export const getFeedbackStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    in_progress: 'blue',
    resolved: 'green',
    closed: 'gray'
  };
  return colors[status] || 'gray';
};

export const getFeedbackPriorityColor = (priority) => {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };
  return colors[priority] || 'gray';
};

// ==================== ICON HELPERS ====================

export const getFeedbackTypeIcon = (type) => {
  const icons = {
    suggestion: '💡',
    bug: '🐛',
    question: '❓',
    order_issue: '📦',
    payment_problem: '💳',
    shipping_delay: '🚚',
    product_quality: '⭐',
    technical_issue: '⚙️',
    account_issue: '👤',
    other: 'ℹ️'
  };
  return icons[type] || 'ℹ️';
};

// ==================== FILTER FUNCTIONS ====================

export const filterFeedbacksByType = (feedbacks, type) => {
  if (!feedbacks || !type || type === 'all') return feedbacks;
  return feedbacks.filter(feedback => feedback.type === type);
};

export const filterFeedbacksByStatus = (feedbacks, status) => {
  if (!feedbacks || !status || status === 'all') return feedbacks;
  return feedbacks.filter(feedback => feedback.status === status);
};

export const filterFeedbacksByPriority = (feedbacks, priority) => {
  if (!feedbacks || !priority || priority === 'all') return feedbacks;
  return feedbacks.filter(feedback => feedback.priority === priority);
};

export const getPendingFeedbacks = (feedbacks) => {
  if (!feedbacks) return [];
  return feedbacks.filter(feedback => feedback.status === FEEDBACK_STATUSES.PENDING);
};

export const getResolvedFeedbacks = (feedbacks) => {
  if (!feedbacks) return [];
  return feedbacks.filter(feedback => feedback.status === FEEDBACK_STATUSES.RESOLVED);
};

// ==================== SORTING FUNCTIONS ====================

export const sortFeedbacksByDate = (feedbacks, order = 'desc') => {
  if (!feedbacks) return [];
  return [...feedbacks].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

export const sortFeedbacksByPriority = (feedbacks, order = 'desc') => {
  if (!feedbacks) return [];
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  return [...feedbacks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 0;
    const priorityB = priorityOrder[b.priority] || 0;
    return order === 'asc' ? priorityA - priorityB : priorityB - priorityA;
  });
};

export const getRecentFeedbacks = (feedbacks, limit = 5) => {
  if (!feedbacks) return [];
  return sortFeedbacksByDate(feedbacks, 'desc').slice(0, limit);
};

// ==================== STATISTICS ====================

export const getFeedbackStatistics = (feedbacks) => {
  if (!feedbacks || feedbacks.length === 0) {
    return {
      total: 0,
      byType: {},
      byStatus: {},
      byPriority: {},
      resolvedPercentage: 0,
      averageResponseTime: 0
    };
  }

  const stats = {
    total: feedbacks.length,
    byType: {},
    byStatus: {},
    byPriority: {},
  };

  // Count by type, status, priority
  feedbacks.forEach(feedback => {
    // Type
    stats.byType[feedback.type] = (stats.byType[feedback.type] || 0) + 1;

    // Status
    stats.byStatus[feedback.status] = (stats.byStatus[feedback.status] || 0) + 1;

    // Priority
    stats.byPriority[feedback.priority] = (stats.byPriority[feedback.priority] || 0) + 1;
  });

  // Calculate resolved percentage
  stats.resolvedPercentage = stats.total > 0
    ? ((stats.byStatus.resolved || 0) / stats.total * 100).toFixed(1)
    : 0;

  // Calculate average response time
  const responseTimes = feedbacks
    .filter(f => f.sla?.responseTime)
    .map(f => f.sla.responseTime);

  stats.averageResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  return stats;
};

// ==================== FORMATTING ====================

export const formatFeedbackData = (feedback) => {
  if (!feedback) return null;

  return {
    ...feedback,
    typeLabel: getFeedbackTypeLabel(feedback.type),
    statusLabel: getFeedbackStatusLabel(feedback.status),
    priorityLabel: getFeedbackPriorityLabel(feedback.priority),
    typeColor: getFeedbackTypeColor(feedback.type),
    statusColor: getFeedbackStatusColor(feedback.status),
    priorityColor: getFeedbackPriorityColor(feedback.priority),
    typeIcon: getFeedbackTypeIcon(feedback.type),
    hasReply: feedback.reply && feedback.reply.length > 0,
    replyCount: feedback.reply?.length || 0,
    isResolved: feedback.status === FEEDBACK_STATUSES.RESOLVED,
    isPending: feedback.status === FEEDBACK_STATUSES.PENDING,
    isInProgress: feedback.status === FEEDBACK_STATUSES.IN_PROGRESS,
    hasUser: !!feedback.user,
    displayName: feedback.displayName || feedback.guestInfo?.name || 'Anonymous',
    contactEmail: feedback.contactEmail || feedback.guestInfo?.email || null
  };
};

export const formatSLATime = (minutes) => {
  if (!minutes || minutes === 0) return 'N/A';

  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

// ==================== VALIDATION ====================

export const validateFeedbackData = (feedbackData) => {
  const errors = [];

  // Message validation
  if (!feedbackData.message || feedbackData.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  if (feedbackData.message && feedbackData.message.length > 2000) {
    errors.push('Message must not exceed 2000 characters');
  }

  // Type validation
  const validTypes = Object.values(FEEDBACK_TYPES);
  if (feedbackData.type && !validTypes.includes(feedbackData.type)) {
    errors.push('Invalid feedback type');
  }

  // Guest info validation
  if (feedbackData.isGuest && !feedbackData.guestInfo?.email) {
    errors.push('Email is required for guest feedback');
  }

  // Email validation
  if (feedbackData.guestInfo?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(feedbackData.guestInfo.email)) {
      errors.push('Please provide a valid email address');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateReplyData = (replyData) => {
  const errors = [];

  if (!replyData.message || replyData.message.trim().length < 5) {
    errors.push('Reply message must be at least 5 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ==================== SEARCH ====================

export const searchFeedbacks = (feedbacks, searchTerm) => {
  if (!feedbacks || !searchTerm) return feedbacks;

  const term = searchTerm.toLowerCase().trim();

  return feedbacks.filter(feedback => {
    return (
      feedback.message?.toLowerCase().includes(term) ||
      feedback.displayName?.toLowerCase().includes(term) ||
      feedback.contactEmail?.toLowerCase().includes(term) ||
      feedback.type?.toLowerCase().includes(term) ||
      feedback.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  });
};

// ==================== EXPORT OPTIONS ====================

export const FEEDBACK_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: FEEDBACK_TYPES.SUGGESTION, label: 'Suggestion' },
  { value: FEEDBACK_TYPES.BUG, label: 'Bug Report' },
  { value: FEEDBACK_TYPES.QUESTION, label: 'Question' },
  { value: FEEDBACK_TYPES.ORDER_ISSUE, label: 'Order Issue' },
  { value: FEEDBACK_TYPES.PAYMENT_PROBLEM, label: 'Payment Problem' },
  { value: FEEDBACK_TYPES.SHIPPING_DELAY, label: 'Shipping Delay' },
  { value: FEEDBACK_TYPES.PRODUCT_QUALITY, label: 'Product Quality' },
  { value: FEEDBACK_TYPES.TECHNICAL_ISSUE, label: 'Technical Issue' },
  { value: FEEDBACK_TYPES.ACCOUNT_ISSUE, label: 'Account Issue' },
  { value: FEEDBACK_TYPES.OTHER, label: 'Other' }
];

export const FEEDBACK_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: FEEDBACK_STATUSES.PENDING, label: 'Pending' },
  { value: FEEDBACK_STATUSES.IN_PROGRESS, label: 'In Progress' },
  { value: FEEDBACK_STATUSES.RESOLVED, label: 'Resolved' },
  { value: FEEDBACK_STATUSES.CLOSED, label: 'Closed' }
];

export const FEEDBACK_PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: FEEDBACK_PRIORITIES.LOW, label: 'Low' },
  { value: FEEDBACK_PRIORITIES.MEDIUM, label: 'Medium' },
  { value: FEEDBACK_PRIORITIES.HIGH, label: 'High' },
  { value: FEEDBACK_PRIORITIES.URGENT, label: 'Urgent' }
];

// ==================== ALIAS EXPORTS FOR BACKWARD COMPATIBILITY ====================
export const getPriorityLabel = getFeedbackPriorityLabel;
export const getPriorityColor = getFeedbackPriorityColor;