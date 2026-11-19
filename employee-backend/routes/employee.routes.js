import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  addEmployee,
  bulkAddEmployees,
  getAllEmployees
} from "../controllers/employee.controller.js";

const router = express.Router();

router.post("/", authMiddleware, addEmployee);
router.post("/bulk", authMiddleware, bulkAddEmployees);
router.get("/", authMiddleware, getAllEmployees);

export default router;
