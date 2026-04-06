import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initializes the email transporter.
 * Priority: 1. Gmail SMTP (via .env) 2. Ethereal (Test account)
 */
export const initTransporter = async () => {
    // 1. Check for real Gmail SMTP credentials in .env
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log("✅ Using Real Gmail SMTP: ", process.env.EMAIL_USER);
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // 2. Fallback to Ethereal for local development or missing .env
    console.warn("⚠️ SMTP credentials not found in .env, using Ethereal fallback.");
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

/**
 * Sends a review invitation email to high-risk employees.
 */
export const sendReviewEmail = async (req, res) => {
    try {
        const { to, subject, employeeName } = req.body;
        
        if (!to) {
            return res.status(400).json({ success: false, message: "Recipient email (to) is required." });
        }

        const transporter = await initTransporter();
        const finalSubject = subject || `Quarterly Satisfaction Review - ${employeeName}`;

        const info = await transporter.sendMail({
            from: `"SmartHR (Attrigen AI)" <${process.env.EMAIL_USER || 'support@smarthr.com'}>`,
            to: to,
            subject: finalSubject,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <div style="background-color: #1e293b; color: white; padding: 25px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">SmartHR Performance Review</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #334155;">
                        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${employeeName}</strong>,</p>
                        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                            At SmartHR, your professional growth and workplace satisfaction are our top priorities. We have scheduled a brief quarterly satisfaction review to hear your valuable feedback regarding your recent experiences and the working environment.
                        </p>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="#" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                                Start Your Feedback Session
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                            <strong>Note:</strong> This review is confidential and will be used to improve organizational policies and team dynamics.
                        </p>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 20px;">
                            If you have any immediate questions or concerns, please reach out directly to your department manager.
                        </p>
                    </div>
                    <div style="background-color: #f8fafc; color: #64748b; padding: 20px 30px; text-align: center; font-size: 13px; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} SmartHR Systems. All rights reserved.</p>
                        <p style="margin: 0;">Empowering Better Organizations Through Data</p>
                    </div>
                </div>
            `,
        });

        const isEthereal = info.envelope && info.envelope.from === 'ethereal.email';
        
        console.log("✅ Email sent:", info.messageId);
        if (isEthereal) console.log("🔗 Ethereal Preview URL:", nodemailer.getTestMessageUrl(info));

        res.json({ 
            success: true, 
            message: "Review invite sent successfully!",
            previewUrl: isEthereal ? nodemailer.getTestMessageUrl(info) : null 
        });

    } catch (error) {
        console.error("❌ Email send error:", error.message);
        
        let status = 500;
        let message = "Failed to process email action. Please check server logs.";
        
        // Handle common Gmail SMTP errors gracefully
        if (error.message.includes("535")) {
            status = 401;
            message = "AUTHENTICATION FAILED: Your Google App Password in .env is incorrect or expired! Please generate a NEW one at myaccount.google.com/apppasswords";
        } else if (error.message.includes("ECONNREFUSED")) {
            message = "CONNECTION FAILED: Could not reach the mail server. Please check your internet or firewall.";
        }
        
        res.status(status).json({ success: false, message: message });
    }
};
