module.exports = ({ order, trackingNumber }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; }
    .section { margin: 15px 0; }
    .section-title { font-weight: bold; color: #2196F3; font-size: 16px; }
    .tracking-box { background-color: #E3F2FD; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
    .button { background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Order is Shipped!</h1>
    </div>
    
    <div class="content">
      <p>Great news! Your order ${order._id} has been shipped.</p>
      
      <div class="tracking-box">
        <div class="section-title">Tracking Number</div>
        <p style="font-size: 20px; color: #2196F3; margin: 10px 0;">${trackingNumber}</p>
      </div>

      <div class="section">
        <p>You can now track your package using the tracking number above.</p>
      </div>

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}/track" class="button">Track Shipment</a>
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
      <p>© 2025 Your Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`
