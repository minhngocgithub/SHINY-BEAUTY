module.exports = ({ user }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; margin: 20px 0; border-radius: 5px; }
    .button { background-color: #667eea; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome, ${user.name}!</h1>
    </div>
    
    <div class="content">
      <p>Thank you for joining our store. We're excited to have you!</p>
      
      <p>As a new member, you get:</p>
      <ul>
        <li>Exclusive welcome discount</li>
        <li>Early access to flash sales</li>
        <li>Loyalty points on every purchase</li>
        <li>Special birthday offers</li>
      </ul>

      <p style="text-align: center;">
        <a href="${process.env.CLIENT_URL}" class="button">Start Shopping</a>
      </p>
    </div>
  </div>
</body>
</html>
`
