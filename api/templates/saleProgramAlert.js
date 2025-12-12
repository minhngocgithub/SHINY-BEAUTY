module.exports = ({ saleProgram, user, discountText }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header { 
      background: linear-gradient(135deg, #9333ea 0%, #e11d48 100%);
      color: white; 
      padding: 40px 30px; 
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .emoji { font-size: 48px; margin-bottom: 15px; display: block; }
    .content { 
      padding: 40px 30px; 
      background: white;
    }
    .greeting { 
      font-size: 18px; 
      color: #333; 
      margin-bottom: 20px;
    }
    .discount-badge { 
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      color: white; 
      font-size: 36px; 
      font-weight: bold; 
      text-align: center;
      padding: 30px;
      border-radius: 15px;
      margin: 30px 0;
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
      transform: rotate(-2deg);
    }
    .description { 
      color: #555; 
      line-height: 1.8; 
      margin: 20px 0;
      font-size: 16px;
    }
    .info-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 20px;
      border-radius: 10px;
      margin: 25px 0;
      border-left: 4px solid #f59e0b;
    }
    .info-box strong { color: #92400e; display: block; margin-bottom: 8px; }
    .info-box p { color: #78350f; margin: 5px 0; font-size: 15px; }
    .cta-button { 
      background: linear-gradient(135deg, #9333ea 0%, #e11d48 100%);
      color: white !important; 
      padding: 18px 40px; 
      text-decoration: none; 
      border-radius: 50px;
      display: inline-block; 
      margin: 30px 0;
      font-weight: bold;
      font-size: 18px;
      text-align: center;
      box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4);
      transition: all 0.3s ease;
    }
    .cta-container { text-align: center; }
    .features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 25px 0;
    }
    .feature-item {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
    }
    .feature-icon { font-size: 24px; margin-bottom: 8px; }
    .feature-text { color: #6b7280; font-size: 14px; }
    .footer { 
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-links { margin: 15px 0; }
    .footer-links a { 
      color: #9333ea; 
      text-decoration: none; 
      margin: 0 10px;
      font-size: 14px;
    }
    .unsubscribe { 
      color: #9ca3af; 
      font-size: 12px; 
      margin-top: 15px;
    }
    .unsubscribe a { color: #6b7280; text-decoration: underline; }
    .banner {
      width: 100%;
      height: auto;
      max-height: 300px;
      object-fit: cover;
    }
    @media only screen and (max-width: 600px) {
      .container { border-radius: 0; }
      .header h1 { font-size: 24px; }
      .discount-badge { font-size: 28px; padding: 20px; }
      .features { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Banner Image -->
    ${saleProgram.bannerImage ? `
    <img src="${saleProgram.bannerImage}" alt="${saleProgram.title}" class="banner">
    ` : ''}
    
    <!-- Header -->
    <div class="header">
      <span class="emoji">🎉</span>
      <h1>${saleProgram.title}</h1>
      <p style="font-size: 16px; margin-top: 10px; opacity: 0.9;">
        ${saleProgram.shortDescription || 'Limited Time Offer'}
      </p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${user.name || 'Valued Customer'},</p>
      
      <p class="description">
        We're excited to announce our latest promotion! Get amazing discounts on your favorite beauty products.
      </p>
      
      <!-- Discount Badge -->
      <div class="discount-badge">
        ${discountText}
      </div>
      
      ${saleProgram.description ? `
      <p class="description">${saleProgram.description}</p>
      ` : ''}
      
      <!-- Sale Info -->
      <div class="info-box">
        <strong>📅 Sale Period</strong>
        <p>Starts: ${new Date(saleProgram.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})}</p>
        ${saleProgram.endDate ? `
        <p>Ends: ${new Date(saleProgram.endDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})}</p>
        ` : '<p>Limited time only!</p>'}
      </div>
      
      <!-- Features -->
      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">💝</div>
          <div class="feature-text">Selected Products</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🚚</div>
          <div class="feature-text">Free Shipping Available</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⭐</div>
          <div class="feature-text">Earn Loyalty Points</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <div class="feature-text">Secure Checkout</div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div class="cta-container">
        <a href="${process.env.CLIENT_URL}/sale/${saleProgram.slug || saleProgram._id}" class="cta-button">
          🛍️ Shop Now
        </a>
      </div>
      
      <p class="description" style="text-align: center; color: #ef4444; font-weight: bold;">
        ⏰ Hurry! Limited stock available
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${process.env.CLIENT_URL}/shop">Browse All Products</a> | 
        <a href="${process.env.CLIENT_URL}/account/profile">My Account</a> | 
        <a href="${process.env.CLIENT_URL}/contact">Contact Us</a>
      </div>
      
      <p class="unsubscribe">
        Don't want promotional emails? 
        <a href="${process.env.CLIENT_URL}/account/notifications">Update your preferences</a>
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} Shiny Beauty. All rights reserved.<br>
        You're receiving this because you subscribed to our promotional emails.
      </p>
    </div>
  </div>
</body>
</html>
`;
