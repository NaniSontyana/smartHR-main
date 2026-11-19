import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is missing in .env");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 8000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error (${error.code || error.message}):`);
    if (error.syscall === 'querySrv' || error.code === 'ENOTFOUND') {
      console.error("👉 Action Required:");
      console.error("   1. Log into MongoDB Atlas: https://cloud.mongodb.com");
      console.error("   2. If your cluster is PAUSED, click 'Resume'.");
      console.error("   3. If you have a newly created cluster, copy its connection string from 'Connect' -> 'Drivers' into employee-backend/.env");
      console.error("   4. Alternatively, point MONGO_URI to local MongoDB: mongodb://127.0.0.1:27017/employee_attrition");
    } else {
      console.error(error.message);
    }
  }
};

export default connectDB;
