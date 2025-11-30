module.exports = ({ order }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; }
    .section { margin: 15px 0; }
    .section-title { font-weight: bold; color: #FF9800; font-size: 16px; margin-bottom: 10px; }
    .timeline-item { padding: 15px; border-left: 3px solid #FF9800; margin-left: 15px; margin-bottom: 10px; }
    .total { font-weight: bold; font-size: 18px; color: #FF9800; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { background-color: #FF9800; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .icon { font-size: 48px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Your Order is Being Prepared</h1>
    </div>
    
    <div class="content">
      <div class="icon">📦</div>
      
      <p>Dear ${order.shippingAddress.fullName},</p>
      <p>Great news! We're packing your items with care and they'll be on their way soon.</p>
      
      <div class="section">
        <div class="section-title">Order Information</div>
        <p><strong>Tracking Number:</strong> ${order.trackingNumber || "Generating..."}</p>
        <p><strong>Order ID:</strong> ${order._id.toString().slice(-8)}</p>
        <p><strong>Status:</strong> Preparing for Shipment</p>
        ${order.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>` : ""}
      </div>

      <div class="section">
        <div class="section-title">What's Being Packed</div>
        <ul>
          ${order.orderItems.map(item => `
            <li><strong>${item.name}</strong> × ${item.quantity}</li>
          `).join("")}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">Next Steps</div>
        <div class="timeline-item">
          <strong>✅ Order Confirmed</strong>
          <p>Your order has been confirmed and payment received</p>
        </div>
        <div class="timeline-item">
          <strong>🔄 Preparing (Current)</strong>
          <p>We're carefully packing your items</p>
        </div>
        <div class="timeline-item">
          <strong>🚚 Shipping Soon</strong>
          <p>Your package will be handed to our courier</p>
        </div>
        <div class="timeline-item">
          <strong>📬 Delivery</strong>
          <p>You'll receive your order soon!</p>
        </div>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}/tracking" class="button">Track Your Order</a>
      </p>

      <p style="font-size: 12px; color: #666; text-align: center;">
        We'll notify you when your order ships.
      </p>
    </div>

    <div class="footer">
      <p>Need help? Contact our support team</p>
      <p>© 2025 Shiny Beauty. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
