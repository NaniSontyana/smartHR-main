import mongoose from "mongoose";
import dotenv from "dotenv";
import EmployeePrediction from "./models/EmployeePrediction.model.js";

dotenv.config();

const debug = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const doc = await EmployeePrediction.findOne();
    console.log("PREDICTION DOC:", doc);
    console.log("KEYS:", Object.keys(doc.toObject()));
    process.exit(0);
};
debug();
