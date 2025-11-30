module.exports = ({ product, oldPrice, newPrice }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #f3e5f5; border: 1px solid #9C27B0; margin: 20px 0; border-radius: 5px; }
    .price-comparison { display: flex; justify-content: space-around; margin: 20px 0; text-align: center; }
    .price-box { padding: 15px; background: white; border-radius: 5px; flex: 1; margin: 0 10px; }
    .old-price { text-decoration: line-through; color: #999; font-size: 18px; }
    .new-price { color: #4CAF50; font-size: 28px; font-weight: bold; }
    .button { background-color: #9C27B0; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Price Drop Alert!</h1>
    </div>
    
    <div class="content">
      <h2 style="text-align: center;">${product.name}</h2>
      
      <div class="price-comparison">
        <div class="price-box">
          <p>Previous Price</p>
          <div class="old-price">₫${oldPrice.toLocaleString()}</div>
        </div>
        <div class="price-box">
          <p>New Price</p>
          <div class="new-price">₫${newPrice.toLocaleString()}</div>
        </div>
      </div>

      <p style="text-align: center; color: #4CAF50; font-size: 18px; font-weight: bold;">
        Save ₫${(oldPrice - newPrice).toLocaleString()}!
      </p>

      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/product/${product._id}" class="button">View Product</a>
      </p>
    </div>
  </div>
</body>
</html>
`
