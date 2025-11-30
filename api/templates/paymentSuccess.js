module.exports = ({ order, transactionId }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; }
    .section { margin: 15px 0; }
    .section-title { font-weight: bold; color: #4CAF50; font-size: 16px; margin-bottom: 10px; }
    .total { font-weight: bold; font-size: 24px; color: #4CAF50; text-align: center; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .icon { font-size: 64px; text-align: center; margin: 20px 0; }
    .checkmark { color: #4CAF50; font-size: 72px; text-align: center; margin: 20px 0; }
    .info-box { background-color: #E8F5E9; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Successful</h1>
    </div>
    
    <div class="content">
      <div class="checkmark">✓</div>
      
      <p style="text-align: center; font-size: 18px;">
        <strong>Thank you for your payment!</strong>
      </p>
      
      <p style="text-align: center;">
        Your payment has been successfully processed and your order is confirmed.
      </p>

      <div class="total">
        $${order.totalPrice.toFixed(2)}
      </div>

      <div class="info-box">
        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId || "N/A"}</p>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <div class="section">
        <div class="section-title">Order Summary</div>
        <p><strong>Order ID:</strong> ${order._id.toString().slice(-8)}</p>
        <p><strong>Tracking Number:</strong> ${order.trackingNumber || "Generating..."}</p>
        <p><strong>Items:</strong> ${order.orderItems.length} item(s)</p>
        ${order.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>` : ""}
      </div>

      <div class="section">
        <div class="section-title">Items Ordered</div>
        <ul>
          ${order.orderItems.map(item => `
            <li><strong>${item.name}</strong> × ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
          `).join("")}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">Payment Breakdown</div>
        <p>Subtotal: $${order.itemsPrice.toFixed(2)}</p>
        <p>Tax: $${order.taxPrice.toFixed(2)}</p>
        <p>Shipping: ${order.shippingPrice === 0 ? "FREE" : "$" + order.shippingPrice.toFixed(2)}</p>
        ${order.totalDiscount > 0 ? `<p style="color: #4CAF50;">Discount: -$${order.totalDiscount.toFixed(2)}</p>` : ""}
        <p style="font-size: 18px; font-weight: bold; margin-top: 10px;">
          Total Paid: $${order.totalPrice.toFixed(2)}
        </p>
      </div>

      <div class="section">
        <div class="section-title">What's Next?</div>
        <p>✅ Payment received and verified</p>
        <p>📦 Your order is being prepared for shipment</p>
        <p>🚚 You'll receive a tracking number when it ships</p>
        <p>📧 We'll keep you updated via email</p>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">View Order Details</a>
      </p>
    </div>

    <div class="footer">
      <p>This is an automated payment confirmation. Please keep this email for your records.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>© 2025 Shiny Beauty. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
