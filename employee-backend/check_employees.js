import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./models/Employee.model.js";

dotenv.config();

const debug = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const doc = await Employee.findOne();
    console.log("EMPLOYEE DOC:", doc);
    console.log("KEYS:", Object.keys(doc.toObject()));
    process.exit(0);
};
debug();
