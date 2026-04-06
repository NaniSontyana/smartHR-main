import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.model.js";

dotenv.config();

const test = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = "test_user_123@test.com";
    const password = "password123";
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create
    await User.deleteMany({ email });
    const user = await User.create({ email, password: hashedPassword, role: "HR" });
    
    // Compare
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    console.log("Password matches new user:", isMatch);
    
    // Find
    const dbUser = await User.findOne({ email });
    const isMatch2 = await bcrypt.compare(password, dbUser.password).catch(() => false);
    console.log("Password matches DB user:", isMatch2);
    
    await mongoose.disconnect();
};

test();
