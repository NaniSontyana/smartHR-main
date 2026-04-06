import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const test = async () => {
    console.log("TESTING Gmail SMTP for:", process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "SMTP Verification Test",
            text: "This is a test of the app password you just updated. If you see this, it works!"
        });
        console.log("✅ SUCCESS! Message ID:", info.messageId);
        process.exit(0);
    } catch (error) {
        console.error("❌ FAILED:", error.message);
        process.exit(1);
    }
};
test();
