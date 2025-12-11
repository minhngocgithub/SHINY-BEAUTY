const Feedback = require('../models/feedback.models');
const User = require('../models/user.models');
const Order = require('../models/order.models');

// Constants
const VALIDATION = {
    MIN_MESSAGE_LENGTH: 10,
    MAX_MESSAGE_LENGTH: 2000,
    MIN_REPLY_LENGTH: 5,
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    USER_DEFAULT_LIMIT: 10
};

const VALID_STATUSES = ['pending', 'in_progress', 'resolved', 'closed'];

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const emitSocketNotification = (io, event, data) => {
    try {
        if (io) {
            io.to('admin').emit(event, data);
        }
    } catch (err) {
        console.error('Socket notification error:', err);
    }
};

const createFeedback = async (req, res) => {
    try {
        const {
            message,
            type,
            priority,
            relatedOrder,
            attachments,
            tags,
            guestInfo
        } = req.body;

        const userId = req.user?._id || null;

        // Validation: Message required
        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Feedback message is required"
            });
        }

        // Validation: Message length
        const trimmedMessage = message.trim();
        if (trimmedMessage.length < VALIDATION.MIN_MESSAGE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Feedback message must be at least ${VALIDATION.MIN_MESSAGE_LENGTH} characters`
            });
        }

        if (trimmedMessage.length > VALIDATION.MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Feedback message must not exceed ${VALIDATION.MAX_MESSAGE_LENGTH} characters`
            });
        }

        // Validation: Guest feedback requires email
        if (!userId) {
            if (!guestInfo?.email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required for guest feedback"
                });
            }

            if (!isValidEmail(guestInfo.email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address"
                });
            }
        }

        // Validation: Related order
        if (relatedOrder) {
            const order = await Order.findById(relatedOrder);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Related order not found"
                });
            }

            // Check order ownership for authenticated users
            if (userId && order.user.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to reference this order"
                });
            }
        }

        // Create feedback data
        const feedbackData = {
            user: userId,
            message: trimmedMessage,
            type: type || 'other',
            status: 'pending',
            sla: {}
        };

        // Optional fields
        if (priority) feedbackData.priority = priority;
        if (relatedOrder) feedbackData.relatedOrder = relatedOrder;
        if (attachments?.length) feedbackData.attachments = attachments;
        if (tags?.length) feedbackData.tags = tags;
        if (!userId && guestInfo) {
            feedbackData.guestInfo = {
                name: guestInfo.name?.trim(),
                email: guestInfo.email.trim().toLowerCase()
            };
        }

        // Create feedback
        const feedback = await Feedback.create(feedbackData);

        // Populate related data
        const populateOptions = [];
        if (userId) {
            populateOptions.push({ path: 'user', select: 'name email avatar' });
        }
        if (relatedOrder) {
            populateOptions.push({ path: 'relatedOrder', select: 'orderNumber totalPrice status' });
        }

        if (populateOptions.length) {
            await feedback.populate(populateOptions);
        }

        // Emit socket notification to admin
        const io = req.app.get('io');
        emitSocketNotification(io, 'feedback:new', {
            feedbackId: feedback._id,
            type: feedback.type,
            priority: feedback.priority,
            message: trimmedMessage.substring(0, 100) + (trimmedMessage.length > 100 ? '...' : ''),
            displayName: feedback.displayName
        });

        res.status(201).json({
            success: true,
            message: "Thank you for your feedback! We'll get back to you soon.",
            feedback
        });

    } catch (error) {
        console.error('Create Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to submit feedback. Please try again later."
        });
    }
};

/**
 * GET FEEDBACKS (ADMIN ONLY)
 * @route GET /api/feedback/admin/all
 * @access Private/Admin
 */
const getFeedbacks = async (req, res) => {
    try {
        const {
            page = VALIDATION.DEFAULT_PAGE,
            limit = VALIDATION.DEFAULT_LIMIT,
            type,
            status,
            priority,
            user,
            sortBy = 'createdAt',
            order = 'desc',
            search
        } = req.query;

        // Build filter
        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (user) filter.user = user;

        // Search functionality
        if (search?.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { message: searchRegex },
                { 'guestInfo.email': searchRegex },
                { 'guestInfo.name': searchRegex },
                { tags: { $in: [searchRegex] } }
            ];
        }

        // Sort options
        const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

        // Secondary sort by priority for date sorting
        if (sortBy === 'createdAt') {
            sortOptions.priority = -1;
        }

        // Pagination
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const [feedbacks, total] = await Promise.all([
            Feedback.find(filter)
                .populate('user', 'name email avatar')
                .populate('reply.admin', 'name avatar role')
                .populate('relatedOrder', 'orderNumber totalPrice status createdAt')
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Feedback.countDocuments(filter)
        ]);

        // Add displayName and contactEmail for frontend display
        const enrichedFeedbacks = feedbacks.map(feedback => ({
            ...feedback,
            displayName: feedback.user?.name || feedback.guestInfo?.name || 'Guest',
            contactEmail: feedback.user?.email || feedback.guestInfo?.email || 'N/A'
        }));

        // Calculate statistics
        const [byStatus, byType, byPriority] = await Promise.all([
            Feedback.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Feedback.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
            Feedback.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }])
        ]);

        // Calculate SLA metrics
        const slaMetrics = await Feedback.aggregate([
            { $match: { 'sla.responseTime': { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: null,
                    avgResponseTime: { $avg: '$sla.responseTime' },
                    avgResolutionTime: { $avg: '$sla.resolutionTime' }
                }
            }
        ]);

        res.json({
            success: true,
            feedbacks: enrichedFeedbacks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            },
            statistics: {
                byStatus,
                byType,
                byPriority,
                sla: {
                    avgResponseTime: slaMetrics[0]?.avgResponseTime || 0,
                    avgResolutionTime: slaMetrics[0]?.avgResolutionTime || 0
                }
            }
        });

    } catch (error) {
        console.error('Get Feedbacks Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve feedbacks"
        });
    }
};

/**
 * GET SINGLE FEEDBACK BY ID
 * @route GET /api/feedback/:id
 * @access Private/Admin
 */
const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findById(id)
            .populate('user', 'name email avatar')
            .populate('reply.admin', 'name avatar role')
            .populate('internalNotes.admin', 'name avatar role')
            .populate('relatedOrder', 'orderNumber totalPrice status createdAt orderItems');

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        res.json({
            success: true,
            feedback
        });

    } catch (error) {
        console.error('Get Feedback By ID Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve feedback"
        });
    }
};

const getMyFeedbacks = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            page = VALIDATION.DEFAULT_PAGE,
            limit = VALIDATION.USER_DEFAULT_LIMIT,
            type,
            status
        } = req.query;

        // Build filter
        const filter = { user: userId };
        if (type) filter.type = type;
        if (status) filter.status = status;

        // Pagination
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const [feedbacks, total] = await Promise.all([
            Feedback.find(filter)
                .populate('reply.admin', 'name avatar role')
                .populate('relatedOrder', 'orderNumber totalPrice status')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Feedback.countDocuments(filter)
        ]);

        res.json({
            success: true,
            feedbacks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        console.error('Get My Feedbacks Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve your feedbacks"
        });
    }
};

const replyFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, internalNote } = req.body;

        // Validation
        if (!message?.trim() && !internalNote?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reply message or internal note is required'
            });
        }

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        let responseMessage = '';

        // Add public reply
        if (message?.trim()) {
            const trimmedMessage = message.trim();

            if (trimmedMessage.length < VALIDATION.MIN_REPLY_LENGTH) {
                return res.status(400).json({
                    success: false,
                    message: `Reply message must be at least ${VALIDATION.MIN_REPLY_LENGTH} characters`
                });
            }

            feedback.reply.push({
                admin: req.user._id,
                message: trimmedMessage
            });

            // Auto-update status to in_progress
            if (feedback.status === 'pending') {
                feedback.status = 'in_progress';
            }

            responseMessage = 'Reply sent successfully';
        }

        // Add internal note
        if (internalNote?.trim()) {
            feedback.internalNotes.push({
                admin: req.user._id,
                note: internalNote.trim()
            });

            responseMessage = message?.trim()
                ? 'Reply and internal note added successfully'
                : 'Internal note added successfully';
        }

        await feedback.save();

        // Populate updated data
        await feedback.populate([
            { path: 'reply.admin', select: 'name avatar role' },
            { path: 'internalNotes.admin', select: 'name avatar role' },
            { path: 'user', select: 'name email avatar' },
            { path: 'relatedOrder', select: 'orderNumber totalPrice status' }
        ]);

        // Send email notification if public reply was added
        if (message?.trim()) {
            try {
                const EmailService = require('../services/email.service');
                const recipientEmail = feedback.user?.email || feedback.guestInfo?.email;
                const recipientName = feedback.user?.name || feedback.guestInfo?.name || 'Customer';

                if (recipientEmail) {
                    await EmailService.sendFeedbackReply(
                        recipientEmail,
                        recipientName,
                        feedback._id,
                        message.trim(),
                        req.user.name || 'Support Team'
                    );
                }
            } catch (emailError) {
                console.error('Failed to send feedback reply email:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.json({
            success: true,
            message: responseMessage,
            feedback
        });

    } catch (error) {
        console.error('Reply Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add reply"
        });
    }
};

const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validation
        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
            });
        }

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        // Prevent unnecessary updates
        if (feedback.status === status) {
            return res.json({
                success: true,
                message: 'Status is already set to ' + status,
                feedback
            });
        }

        feedback.status = status;
        await feedback.save();

        await feedback.populate([
            { path: 'user', select: 'name email avatar' },
            { path: 'relatedOrder', select: 'orderNumber totalPrice status' }
        ]);

        res.json({
            success: true,
            message: `Feedback status updated to ${status}`,
            feedback
        });

    } catch (error) {
        console.error('Update Feedback Status Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update status"
        });
    }
};

const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        await feedback.deleteOne();

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });

    } catch (error) {
        console.error('Delete Feedback Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete feedback"
        });
    }
};

module.exports = {
    createFeedback,
    getFeedbacks,
    getFeedbackById,
    getMyFeedbacks,
    replyFeedback,
    updateFeedbackStatus,
    deleteFeedback
};