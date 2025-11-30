module.exports = ({ order }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; }
    .button { background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Order Delivered</h1>
    </div>
    
    <div class="content">
      <p>Your order ${order._id} has been delivered!</p>
      <p>Thank you for your purchase. We hope you enjoy your items.</p>
      
      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}/review" class="button">Leave a Review</a>
      </p>
    </div>
  </div>
</body>
</html>
`
