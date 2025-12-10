// Notification Test Helper
// Use in browser console to test different notification types

export const testNotifications = {
    // Test Review Reply Notification
    reviewReply: () => {
        const notification = {
            id: Date.now().toString(),
            type: 'review_reply',
            title: '💬 Admin replied to your review',
            message: 'Thank you for your detailed feedback! We appreciate your support.',
            data: {
                reviewId: '67xxx',
                productId: '67yyy',
                productName: 'Vitamin C Serum',
                adminName: 'Support Team',
                replyMessage: 'Thank you for your detailed feedback!'
            },
            actionUrl: '/product/67yyy#reviews',
            read: false,
            createdAt: new Date().toISOString()
        };

        console.log('Test Notification:', notification);
        return notification;
    },

    // Test New Sale Program
    newSaleProgram: () => {
        return {
            id: Date.now().toString(),
            type: 'new_sale_program',
            title: '🎉 New Sale: Black Friday Sale',
            message: 'Get up to 50% off on Skincare products! Limited time only!',
            data: {
                saleProgramId: '67sale',
                programName: 'Black Friday Sale',
                discount: '50%',
                categorySlug: 'skincare',
                validUntil: '2025-12-31'
            },
            actionUrl: '/shop/skincare',
            read: false,
            createdAt: new Date().toISOString(),
            priority: 'high'
        };
    },

    // Test New Product
    newProduct: () => {
        return {
            id: Date.now().toString(),
            type: 'new_product',
            title: '🆕 New Product Available',
            message: 'Check out our new Premium Retinol Night Cream!',
            data: {
                productId: '67prod',
                productName: 'Premium Retinol Night Cream',
                price: 299000,
                categoryName: 'Skincare'
            },
            actionUrl: '/product/67prod',
            read: false,
            createdAt: new Date().toISOString()
        };
    },

    // Test Loyalty Points
    loyaltyPoints: () => {
        return {
            id: Date.now().toString(),
            type: 'loyalty_points_earned',
            title: '⭐ You earned 100 points!',
            message: 'Your recent purchase earned you 100 loyalty points. Total: 1,500 points',
            data: {
                points: 100,
                totalPoints: 1500,
                tierName: 'Gold'
            },
            actionUrl: '/account/profile?tab=loyalty',
            read: false,
            createdAt: new Date().toISOString()
        };
    },

    // Test Order Delivered
    orderDelivered: () => {
        return {
            id: Date.now().toString(),
            type: 'order_delivered',
            title: '✨ Your order has been delivered!',
            message: 'Order #12345 has been successfully delivered. Enjoy your products!',
            data: {
                orderId: '67order',
                orderNumber: '#12345',
                status: 'DELIVERED'
            },
            actionUrl: '/orders/67order',
            read: false,
            createdAt: new Date().toISOString()
        };
    },

    // Test Flash Sale
    flashSale: () => {
        return {
            id: Date.now().toString(),
            type: 'flash_sale',
            title: '⚡ Flash Sale Alert!',
            message: 'Limited time offer: 70% off on selected items. Hurry up!',
            data: {
                saleProgramId: '67flash',
                programName: 'Flash Sale',
                discount: '70%',
                validUntil: new Date(Date.now() + 3600000).toISOString() // 1 hour
            },
            actionUrl: '/sale/67flash',
            read: false,
            createdAt: new Date().toISOString(),
            priority: 'high'
        };
    },

    // Test Review Approved
    reviewApproved: () => {
        return {
            id: Date.now().toString(),
            type: 'review_approved',
            title: '✅ Your review has been published',
            message: 'Thank you for sharing your experience with Vitamin C Serum!',
            data: {
                reviewId: '67rev',
                productId: '67prod',
                productName: 'Vitamin C Serum'
            },
            actionUrl: '/product/67prod#reviews',
            read: false,
            createdAt: new Date().toISOString()
        };
    },

    // Inject test notification into store
    injectToStore: (notification) => {
        // For testing in browser console
        // window.$nuxt.$store.state.notification.notifications.unshift(notification);
        console.log('To inject into store, use:');
        console.log('const notifStore = useNotificationStore();');
        console.log('notifStore.notifications.unshift(notification);');
        return notification;
    },

    // Generate all test notifications
    generateAll: () => {
        return [
            testNotifications.reviewReply(),
            testNotifications.newSaleProgram(),
            testNotifications.newProduct(),
            testNotifications.loyaltyPoints(),
            testNotifications.orderDelivered(),
            testNotifications.flashSale(),
            testNotifications.reviewApproved()
        ];
    }
};

// Example usage in browser console:
// import { testNotifications } from './notificationTestHelper';
// const testNotif = testNotifications.reviewReply();
// console.log(testNotif);

export default testNotifications;
