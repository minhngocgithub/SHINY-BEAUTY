module.exports = ({ order, customerName }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; }
    .section { margin: 15px 0; }
    .section-title { font-weight: bold; color: #9C27B0; font-size: 16px; margin-bottom: 10px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { background-color: #9C27B0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .icon { font-size: 64px; text-align: center; margin: 20px 0; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin: 20px 0; }
    .product-item { text-align: center; padding: 10px; background: white; border-radius: 5px; }
    .rating-stars { color: #FFB400; font-size: 20px; text-align: center; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ How Was Your Order?</h1>
    </div>
    
    <div class="content">
      <div class="icon">💝</div>
      
      <p>Hi ${customerName || "Valued Customer"},</p>
      
      <p style="font-size: 16px;">
        We hope you're enjoying your recent purchase! Your feedback helps us serve you better and helps other customers make informed decisions.
      </p>

      <div class="section">
        <div class="section-title">Order Details</div>
        <p><strong>Order ID:</strong> ${order._id.toString().slice(-8)}</p>
        <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
        <p><strong>Delivered On:</strong> ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : "Recently"}</p>
      </div>

      <div class="section">
        <div class="section-title">Products to Review</div>
        <div class="product-grid">
          ${order.orderItems.map(item => `
            <div class="product-item">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; border-radius: 5px;">` : ""}
              <p style="font-size: 12px; margin-top: 5px;"><strong>${item.name}</strong></p>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="section" style="background-color: #F3E5F5; padding: 20px; border-radius: 5px; text-align: center;">
        <h3 style="color: #9C27B0; margin-top: 0;">Share Your Experience</h3>
        <div class="rating-stars">★ ★ ★ ★ ★</div>
        <p>How would you rate your purchase?</p>
        <p>Your honest review helps thousands of customers make better choices.</p>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}/review" class="button">Write a Review</a>
      </p>

      <div class="section">
        <div class="section-title">Why Review?</div>
        <ul style="line-height: 1.8;">
          <li>💰 <strong>Earn loyalty points</strong> for your next purchase</li>
          <li>👥 Help other customers make informed decisions</li>
          <li>📢 Share your experience with the community</li>
          <li>🎁 Get featured on our website (best reviews)</li>
        </ul>
      </div>

      <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
        This review reminder was sent 3 days after your delivery.<br>
        If you already submitted a review, thank you! You can ignore this email.
      </p>
    </div>

    <div class="footer">
      <p>Thank you for being a valued customer!</p>
      <p>© 2025 Shiny Beauty. All rights reserved.</p>
      <p style="margin-top: 10px;">
        <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #666; text-decoration: none;">Unsubscribe from review reminders</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
