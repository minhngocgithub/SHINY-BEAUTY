/**
 * Generic Campaign Email Template
 * Flexible template for any campaign type
 */
module.exports = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title || 'Shiny Beauty'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: ${data.headerColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                ${data.headerTitle || 'Shiny Beauty'}
                            </h1>
                            ${data.headerSubtitle ? `
                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                                ${data.headerSubtitle}
                            </p>
                            ` : ''}
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi ${data.userName || 'Valued Customer'},
                            </p>
                            
                            ${data.content || data.message || ''}

                            <!-- CTA Button -->
                            ${data.actionUrl ? `
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${data.actionUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                                    ${data.ctaText || 'Learn More'} →
                                </a>
                            </div>
                            ` : ''}
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
