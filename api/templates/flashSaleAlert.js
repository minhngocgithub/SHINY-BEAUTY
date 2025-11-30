module.exports = ({ product, discount, endTime }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #fff3e0; border: 2px solid #FF9800; margin: 20px 0; border-radius: 5px; }
    .discount { font-size: 48px; color: #FF9800; font-weight: bold; text-align: center; }
    .button { background-color: #FF9800; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .countdown { text-align: center; color: #f44336; font-weight: bold; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Flash Sale Alert!</h1>
    </div>
    
    <div class="content">
      <p>One of your wishlist items is on flash sale!</p>
      
      <h2 style="text-align: center;">${product.name}</h2>
      
      <div class="discount">${discount}% OFF</div>
      
      <div class="countdown">
        Offer ends: ${new Date(endTime).toLocaleString()}
      </div>

      <p style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/product/${product._id}" class="button">Shop Now</a>
      </p>
    </div>
  </div>
</body>
</html>
`
