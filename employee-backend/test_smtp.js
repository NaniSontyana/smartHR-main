import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
    }
});

console.log("Testing Gmail SMTP with user:", process.env.EMAIL_USER);

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP CONNECTION FAILED:", error);
  } else {
    console.log("✅ Gmail SMTP is ready to take our messages!");
  }
  process.exit(0);
});
