/**
 * Christmas 2025 Email Template
 * Professional Christmas themed email with festive design
 */
module.exports = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Merry Christmas 2025</title>
    <link href="https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@400;700&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background: linear-gradient(135deg, #1a472a 0%, #0f2922 100%);">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    
                    <!-- Snow Animation Header -->
                    <tr>
                        <td style="background: linear-gradient(180deg, #d32f2f 0%, #c62828 100%); padding: 0; position: relative; overflow: hidden;">
                            <!-- Snowflakes Background Pattern -->
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg=='); opacity: 0.3;"></div>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="padding: 50px 30px; text-align: center; position: relative; z-index: 1;">
                                        <!-- Christmas Icons -->
                                        <div style="font-size: 48px; margin-bottom: 20px; line-height: 1;">
                                            🎅 🎄 ⛄
                                        </div>
                                        
                                        <!-- Main Heading -->
                                        <h1 style="margin: 0; color: #ffffff; font-size: 48px; font-weight: 700; font-family: 'Mountains of Christmas', cursive; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); letter-spacing: 2px;">
                                            Merry Christmas
                                        </h1>
                                        <div style="margin: 15px 0 0; color: #ffd700; font-size: 32px; font-weight: 600; font-family: 'Mountains of Christmas', cursive; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                                            🎁 2025 🎁
                                        </div>
                                        
                                        <!-- Decorative Line -->
                                        <div style="width: 120px; height: 3px; background: linear-gradient(90deg, transparent, #ffd700, transparent); margin: 25px auto;"></div>
                                        
                                        <p style="margin: 0; color: #ffffff; font-size: 18px; opacity: 0.95; font-weight: 300;">
                                            ✨ Season's Greetings from Shiny Beauty ✨
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 50px 40px; background: linear-gradient(180deg, #ffffff 0%, #fff8f0 100%);">
                            <!-- Personalized Greeting -->
                            <div style="text-align: center; margin-bottom: 30px;">
                                <p style="margin: 0; color: #1a472a; font-size: 22px; font-weight: 600; line-height: 1.4;">
                                    🎊 Dear ${data.userName || 'Valued Customer'}, 🎊
                                </p>
                            </div>

                            <!-- Message -->
                            <p style="margin: 0 0 25px; color: #333333; font-size: 16px; line-height: 1.8; text-align: center;">
                                ${data.message || 'Wishing you a magical Christmas filled with joy, love, and beauty! 🌟'}
                            </p>

                            <!-- Special Offer Section -->
                            ${data.discount ? `
                            <div style="background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); border-radius: 20px; padding: 35px; margin: 35px 0; text-align: center; box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3); position: relative; overflow: hidden;">
                                <!-- Decorative Elements -->
                                <div style="position: absolute; top: -10px; right: -10px; font-size: 80px; opacity: 0.1;">🎄</div>
                                <div style="position: absolute; bottom: -10px; left: -10px; font-size: 80px; opacity: 0.1;">🎅</div>
                                
                                <div style="position: relative; z-index: 1;">
                                    <div style="font-size: 40px; margin-bottom: 15px;">🎁</div>
                                    <h2 style="margin: 0 0 15px; color: #ffd700; font-size: 28px; font-weight: 700; font-family: 'Mountains of Christmas', cursive; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                        Christmas Special Offer
                                    </h2>
                                    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 50px; padding: 20px 45px; display: inline-block; margin: 10px 0;">
                                        <p style="margin: 0; color: #d32f2f; font-size: 42px; font-weight: 700; line-height: 1;">
                                            ${data.discount}% OFF
                                        </p>
                                    </div>
                                    <p style="margin: 15px 0 0; color: #ffffff; font-size: 16px; font-weight: 300;">
                                        ⭐ On Selected Beauty Products ⭐
                                    </p>
                                </div>
                            </div>
                            ` : ''}

                            <!-- Featured Products -->
                            ${data.products && data.products.length > 0 ? `
                            <div style="margin: 40px 0;">
                                <h3 style="margin: 0 0 25px; color: #1a472a; font-size: 24px; text-align: center; font-weight: 600;">
                                    🎄 Christmas Beauty Collection 🎄
                                </h3>
                                
                                ${data.products.map(product => `
                                    <div style="background: #ffffff; border: 2px solid #e8f5e9; border-radius: 12px; padding: 20px; margin-bottom: 20px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(26, 71, 42, 0.1);">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                ${product.image ? `
                                                <td width="100" style="padding-right: 15px; vertical-align: middle;">
                                                    <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; border-radius: 10px; object-fit: cover; border: 2px solid #ffd700;" />
                                                </td>
                                                ` : ''}
                                                <td style="vertical-align: middle;">
                                                    <h4 style="margin: 0 0 10px; color: #1a472a; font-size: 18px; font-weight: 600;">
                                                        ${product.name}
                                                    </h4>
                                                    ${product.description ? `
                                                    <p style="margin: 0 0 12px; color: #666; font-size: 14px; line-height: 1.5;">
                                                        ${product.description}
                                                    </p>
                                                    ` : ''}
                                                    <div style="margin-top: 8px;">
                                                        ${product.originalPrice ? `
                                                        <span style="text-decoration: line-through; color: #999; font-size: 16px; margin-right: 10px;">
                                                            $${product.originalPrice}
                                                        </span>
                                                        ` : ''}
                                                        <span style="color: #d32f2f; font-size: 24px; font-weight: 700;">
                                                            $${product.salePrice || product.price}
                                                        </span>
                                                        ${product.savings ? `
                                                        <span style="background: #4caf50; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 10px;">
                                                            Save $${product.savings}
                                                        </span>
                                                        ` : ''}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                `).join('')}
                            </div>
                            ` : ''}

                            <!-- Countdown Timer -->
                            ${data.endsAt ? `
                            <div style="background: linear-gradient(135deg, #ffd700 0%, #ffab00 100%); border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">
                                <div style="font-size: 32px; margin-bottom: 10px;">⏰</div>
                                <p style="margin: 0; color: #1a472a; font-size: 16px; font-weight: 600;">
                                    <strong>Offer Ends:</strong> ${new Date(data.endsAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})}
                                </p>
                            </div>
                            ` : ''}

                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 40px 0 30px;">
                                <a href="${data.actionUrl || '#'}" style="display: inline-block; background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4); transition: all 0.3s;">
                                    🎁 Shop Christmas Sale 🎁
                                </a>
                            </div>

                            <!-- Additional Message -->
                            ${data.additionalMessage ? `
                            <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; margin: 30px 0; border-radius: 8px;">
                                <p style="margin: 0; color: #e65100; font-size: 15px; line-height: 1.6;">
                                    💝 <strong>Special Note:</strong> ${data.additionalMessage}
                                </p>
                            </div>
                            ` : ''}

                            <!-- Gift Icons Section -->
                            <div style="text-align: center; margin: 30px 0 20px; padding: 25px; background: linear-gradient(135deg, #e3f2fd 0%, #fff8f0 100%); border-radius: 12px;">
                                <div style="font-size: 36px; margin-bottom: 15px; line-height: 1;">
                                    🎁 🎀 ⭐ 🔔 🕯️
                                </div>
                                <p style="margin: 0; color: #1a472a; font-size: 16px; font-weight: 500; line-height: 1.6;">
                                    May your holidays sparkle with moments of love, laughter, and goodwill.<br/>
                                    And may the year ahead be full of contentment and joy! 🌟
                                </p>
                            </div>

                            <!-- Closing -->
                            <p style="margin: 30px 0 0; color: #666666; font-size: 15px; line-height: 1.8; text-align: center;">
                                With warmest wishes,<br/>
                                <strong style="color: #1a472a; font-size: 17px;">The Shiny Beauty Team</strong> 💄✨
                            </p>
                        </td>
                    </tr>

                    <!-- Footer with Christmas Theme -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a472a 0%, #0f2922 100%); padding: 40px 30px; text-align: center;">
                            <!-- Social Icons -->
                            ${data.socialLinks ? `
                            <div style="margin-bottom: 25px;">
                                ${data.socialLinks.facebook ? `<a href="${data.socialLinks.facebook}" style="display: inline-block; margin: 0 8px; color: #ffd700; text-decoration: none; font-size: 24px;">📘</a>` : ''}
                                ${data.socialLinks.instagram ? `<a href="${data.socialLinks.instagram}" style="display: inline-block; margin: 0 8px; color: #ffd700; text-decoration: none; font-size: 24px;">📷</a>` : ''}
                                ${data.socialLinks.twitter ? `<a href="${data.socialLinks.twitter}" style="display: inline-block; margin: 0 8px; color: #ffd700; text-decoration: none; font-size: 24px;">🐦</a>` : ''}
                            </div>
                            ` : ''}
                            
                            <div style="border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 25px;">
                                <p style="margin: 0 0 10px; color: #ffd700; font-size: 18px; font-weight: 600; font-family: 'Mountains of Christmas', cursive;">
                                    🎄 Shiny Beauty 🎄
                                </p>
                                <p style="margin: 0 0 15px; color: #b2dfdb; font-size: 13px; line-height: 1.6;">
                                    Premium Beauty & Cosmetics<br/>
                                    Making your Christmas more beautiful ✨
                                </p>
                                <p style="margin: 0 0 15px; color: #80cbc4; font-size: 12px;">
                                    You're receiving this because you subscribed to our newsletter.
                                </p>
                                <p style="margin: 0; font-size: 12px;">
                                    <a href="{{unsubscribeUrl}}" style="color: #ffd700; text-decoration: none; font-weight: 500;">Unsubscribe</a> | 
                                    <a href="${data.privacyUrl || '#'}" style="color: #ffd700; text-decoration: none; font-weight: 500;">Privacy Policy</a>
                                </p>
                            </div>

                            <!-- Final Christmas Message -->
                            <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                                <p style="margin: 0; color: #ffd700; font-size: 14px; font-family: 'Mountains of Christmas', cursive;">
                                    ❄️ Merry Christmas & Happy New Year 2025! ❄️
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Copyright -->
                <div style="text-align: center; padding: 20px; color: #b2dfdb; font-size: 12px;">
                    © 2025 Shiny Beauty. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`;
