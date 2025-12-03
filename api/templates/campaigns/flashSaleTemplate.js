/**
 * Flash Sale Email Template
 */
module.exports = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flash Sale Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">⚡ FLASH SALE</h1>
                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 18px; opacity: 0.9;">Limited Time Only!</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi ${data.userName || 'Valued Customer'},
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                ${data.message || 'Our exclusive flash sale is now LIVE! Get amazing discounts on selected products.'}
                            </p>

                            <!-- Sale Badge -->
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="display: inline-block; background-color: #ff4757; color: #ffffff; padding: 15px 40px; border-radius: 50px; font-size: 28px; font-weight: bold;">
                                    UP TO ${data.discount || '50'}% OFF
                                </div>
                            </div>

                            <!-- Product Info (if provided) -->
                            ${data.products ? `
                            <div style="margin: 30px 0;">
                                <h3 style="margin: 0 0 15px; color: #333333; font-size: 20px;">Featured Products:</h3>
                                ${data.products.map(product => `
                                    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                                        <h4 style="margin: 0 0 10px; color: #667eea;">${product.name}</h4>
                                        <p style="margin: 0; color: #666;">
                                            <span style="text-decoration: line-through; color: #999;">$${product.originalPrice}</span>
                                            <span style="font-size: 20px; font-weight: bold; color: #ff4757; margin-left: 10px;">$${product.salePrice}</span>
                                        </p>
                                    </div>
                                `).join('')}
                            </div>
                            ` : ''}

                            <!-- Countdown Timer (if provided) -->
                            ${data.endsAt ? `
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    ⏰ <strong>Hurry! Sale ends: ${new Date(data.endsAt).toLocaleString()}</strong>
                                </p>
                            </div>
                            ` : ''}

                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${data.actionUrl || '#'}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                                    Shop Now →
                                </a>
                            </div>

                            <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Don't miss out on these incredible deals!
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                                Shiny Beauty - Premium Cosmetics
                            </p>
                            <p style="margin: 0 0 15px; color: #999999; font-size: 12px;">
                                You're receiving this because you subscribed to our newsletter.
                            </p>
                            <p style="margin: 0; font-size: 12px;">
                                <a href="{{unsubscribeUrl}}" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
