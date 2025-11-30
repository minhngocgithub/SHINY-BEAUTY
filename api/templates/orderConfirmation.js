module.exports = ({ order }) => `
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
    table { width: 100%; border-collapse: collapse; }
    th { background-color: #f2f2f2; padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    .total { font-weight: bold; font-size: 18px; color: #4CAF50; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
    </div>
    
    <div class="content">
      <p>Dear Customer,</p>
      <p>Thank you for your order! We've received your purchase and are preparing it for shipment.</p>
      
      <div class="section">
        <div class="section-title">Order Details</div>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>

      <div class="section">
        <div class="section-title">Items Ordered</div>
        <table>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
          ${order.orderItems
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>₫${item.price.toLocaleString()}</td>
              <td>₫${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `,
            )
            .join("")}
        </table>
      </div>

      <div class="section">
        <div class="section-title">Pricing Summary</div>
        <p><strong>Subtotal:</strong> ₫${order.itemsPrice.toLocaleString()}</p>
        <p><strong>Tax (10%):</strong> ₫${order.taxPrice.toLocaleString()}</p>
        <p><strong>Shipping:</strong> ${order.shippingPrice === 0 ? "Free" : "₫" + order.shippingPrice.toLocaleString()}</p>
        ${order.totalDiscount > 0 ? `<p><strong>Discount:</strong> -₫${order.totalDiscount.toLocaleString()}</p>` : ""}
        <p class="total">Total: ₫${order.totalPrice.toLocaleString()}</p>
      </div>

      <div class="section">
        <div class="section-title">Shipping Address</div>
        <p>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}<br>
          Phone: ${order.shippingAddress.phone}
        </p>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">Track Order</a>
      </p>
    </div>

    <div class="footer">
      <p>Thank you for shopping with us!</p>
      <p>© 2025 Your Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`
