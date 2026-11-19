import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";
import { initTransporter } from "./email.controller.js";
import nodemailer from "nodemailer";

// Temporary in-memory OTP store with TTL expiration (5 minutes)
// In production scale-out, backed by Redis
const otpStore = new Map();
const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

// ----------------------
// SIGN UP (Register HR)
// ----------------------
export const signUp = async (req, res) => {
  try {
    let { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    email = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role: "HR"
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      role: user.role,
      userId: user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
};

// ----------------------
// SIGN IN (Login HR)
// ----------------------
export const signIn = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    email = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    
    // Additional helpful error message if they try to login to a magic-link only account
    if (!isMatch && user.password === "MOCK_PASSWORD") {
      return res.status(401).json({ message: "This account was created via Email OTP without a password. Please sign up again or use Email OTP." });
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Signin successful",
      token,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signin failed" });
  }
};

// ----------------------
// SIGN OUT
// ----------------------
export const signOut = async (req, res) => {
  // JWT is stateless → frontend removes token
  res.json({ message: "Signout successful" });
};
// ----------------------
// SEND OTP / MAGIC LINK
// ----------------------
export const sendOtp = async (req, res) => {
    try {
        let { email, type } = req.body;
        
        if (!email) return res.status(400).json({ message: "Email is required" });
        email = email.toLowerCase();
        
        let user = await User.findOne({ email });

        if (type === "login" && !user) {
            return res.status(404).json({ message: "Account not found. Please sign up first." });
        }

        if (type === "signup" && user) {
            return res.status(409).json({ message: "Account already exists. Please log in." });
        }
        
        // Generate a 6-digit OTP with 5-minute TTL
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + OTP_EXPIRATION_MS
        });

        const mailer = await initTransporter();
        
        const mailOptions = {
          from: `"SmartHR Authentication" <${process.env.EMAIL_USER || 'support@smarthr.com'}>`,
          to: email,
          subject: "Your SmartHR Login Verification Code",
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <div style="background-color: #1e293b; color: white; padding: 25px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">SmartHR Secure Verification</h1>
              </div>
              <div style="padding: 40px 30px; color: #334155;">
                <p style="font-size: 16px; margin-top: 0;">Hello,</p>
                <p style="font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                  You are receiving this email because a request was made to authenticate your SmartHR account. Please use the verification code below to complete your sign-in process.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <span style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 15px 30px; font-size: 32px; font-weight: 700; color: #2563eb; letter-spacing: 4px;">
                    ${otp}
                  </span>
                </div>
                
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                  <strong>Security Notice:</strong> This code is valid for a limited time. Please do not share this code with anyone. SmartHR employees will never ask you for this code.
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 20px;">
                  If you did not request this verification, please ignore this email or contact your IT administrator.
                </p>
              </div>
              <div style="background-color: #f8fafc; color: #64748b; padding: 20px 30px; text-align: center; font-size: 13px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} SmartHR Systems. All rights reserved.</p>
                <p style="margin: 0;">Empowering Better Organizations Through Data</p>
              </div>
            </div>
          `
        };

        const info = await mailer.sendMail(mailOptions);
        let previewUrl = null;
        if (info.messageId && !info.messageId.startsWith("mock-")) {
            previewUrl = nodemailer.getTestMessageUrl(info) || null;
        }
        
        console.log(`[AUTH] Verification OTP generated for ${email} (expires in 5 minutes)`);

        // Do not leak OTP in production responses.
        const responseData = { message: "OTP sent to your email", previewUrl };
        if (process.env.NODE_ENV === "test") {
            responseData.testCode = otp;
        }

        res.json(responseData);
    } catch (error) {
        console.error("Failed to send OTP via SMTP:", error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

// ----------------------
// VERIFY OTP / SIGN IN
// ----------------------
export const verifyOtp = async (req, res) => {
    try {
        let { email, otp, type, signupData } = req.body;
        
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });
        email = email.toLowerCase();
        
        const stored = otpStore.get(email);
        
        if (!stored || stored.expiresAt < Date.now() || stored.otp !== otp) {
            if (stored && stored.expiresAt < Date.now()) {
                otpStore.delete(email);
            }
            return res.status(401).json({ message: "Invalid or expired OTP" });
        }
        
        // Clear OTP immediately upon verification
        otpStore.delete(email);

        let user = await User.findOne({ email });

        if (type === "signup") {
            if (user) return res.status(409).json({ message: "Account already exists." });
            
            let hashedPassword = "MOCK_PASSWORD";
            if (signupData && signupData.password) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(signupData.password, salt);
            }
            
            user = await User.create({ email, role: "HR", password: hashedPassword });
        } else {
            if (!user) return res.status(404).json({ message: "Account not found." });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Verify successful",
            token,
            role: user.role
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Verification failed" });
    }
};

// ----------------------
// GET ME (Current User Profile)
// ----------------------
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

// ----------------------
// UPDATE ME (Update User Profile)
// ----------------------
export const updateMe = async (req, res) => {
    try {
        const { username, phone, department, avatar } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (username !== undefined) user.username = username;
        if (phone !== undefined) user.phone = phone;
        if (department !== undefined) user.department = department;
        if (avatar !== undefined) user.avatar = avatar;
        
        await user.save();
        
        const updatedUser = await User.findById(req.user.id).select("-password");
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("UpdateMe error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};
