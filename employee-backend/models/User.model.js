import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "HR"
    },
    username: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    department: {
      type: String,
      default: ""
    },
    avatar: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);


