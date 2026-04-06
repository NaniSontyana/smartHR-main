import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`- ${u.name} (${u.email})`));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUsers();
