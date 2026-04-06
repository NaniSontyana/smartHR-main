import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  addEmployee,
  getAllEmployees
} from "../controllers/employee.controller.js";

const router = express.Router();

router.post("/", authMiddleware, addEmployee);
router.get("/", authMiddleware, getAllEmployees);

export default router;
