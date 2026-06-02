import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.model.js";

dotenv.config();

const seedUser = async () => {
    try {
        console.log("Loading environment...");
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is undefined. Check .env file.");
        }
        console.log("Connecting to MongoDB:", process.env.MONGO_URI.split("@")[1]); // Log safe part of URI
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding");

        const email = "admin@example.com";
        const password = "password123";

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists:", email);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await User.create({
                email,
                password: hashedPassword,
                role: "HR"
            });
            console.log("Created admin user:", email);
        }
        process.exit();
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedUser();
