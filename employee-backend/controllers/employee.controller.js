import Employee from '../models/Employee.model.js';
import EmployeePrediction from '../models/EmployeePrediction.model.js';
import { emitEmployeesChanged } from '../config/socket.js';

export const addEmployee = async (req, res) => {
  try {
    const { employeeId, name } = req.body;
    if (!employeeId || !name) {
      return res.status(400).json({
        message: 'employeeId and name are required'
      });
    }

    const existing = await Employee.findOne({ employeeId });
    if (existing) {
      return res.status(409).json({ message: `Employee with ID ${employeeId} already exists` });
    }

    const employee = await Employee.create(req.body);
    emitEmployeesChanged({ type: "added", employee });
    res.status(201).json(employee);
  } catch (error) {
    console.error("addEmployee error:", error);
    res.status(500).json({ message: 'Failed to add employee', error: error.message });
  }
};

/**
 * Bulk upload employees from HRIS / CSV import
 */
export const bulkAddEmployees = async (req, res) => {
  try {
    const { employees } = req.body;
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ success: false, message: 'Expected non-empty employees array' });
    }

    const operations = employees
      .filter(emp => emp && (emp.employeeId || emp["Employee ID"] || emp.name))
      .map((emp, index) => {
        const empId = emp.employeeId || emp["Employee ID"] || `EMP_${Date.now()}_${index}`;
        const sanitized = {
          employeeId: String(empId).trim(),
          name: emp.name || emp.Name || `Employee ${empId}`,
          email: emp.email || emp.Email || `${String(empId).toLowerCase()}@company.com`,
          department: emp.department || emp.Department || "General",
          jobRole: emp.jobRole || emp["Job Role"] || "Staff",
          age: Number(emp.age || emp.Age || 30),
          monthlyIncome: Number(emp.monthlyIncome || emp["Monthly Income"] || 5000),
          yearsAtCompany: Number(emp.yearsAtCompany || emp["Years at Company"] || 2),
          overtime: String(emp.overtime || emp.Overtime || emp.overTime || "No"),
          workLifeBalance: Number(emp.workLifeBalance || emp["Work-Life Balance"] || 3),
          jobSatisfaction: Number(emp.jobSatisfaction || emp["Job Satisfaction"] || 3),
          performanceRating: Number(emp.performanceRating || emp["Performance Rating"] || 3),
          attrition: String(emp.attrition || emp.Attrition || "No")
        };

        return {
          updateOne: {
            filter: { employeeId: sanitized.employeeId },
            update: { $set: sanitized },
            upsert: true
          }
        };
      });

    if (operations.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid employee records found in payload' });
    }

    const result = await Employee.bulkWrite(operations);
    emitEmployeesChanged({ type: "bulk_imported", count: operations.length });

    res.json({
      success: true,
      message: `Successfully processed ${operations.length} employee records`,
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    });

  } catch (error) {
    console.error("bulkAddEmployees error:", error);
    res.status(500).json({ success: false, message: 'Failed to bulk import employees', error: error.message });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { department, jobRole, attritionRisk, search } = req.query;

    const employeeFilter = {};

    if (department && department !== 'All') {
      employeeFilter.department = department;
    }

    if (jobRole && jobRole !== 'All') {
      employeeFilter.jobRole = jobRole;
    }

    if (search && search.trim()) {
      const term = search.trim();
      employeeFilter.$or = [
        { name: { $regex: term, $options: "i" } },
        { employeeId: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { jobRole: { $regex: term, $options: "i" } }
      ];
    }

    if (attritionRisk && attritionRisk !== 'All') {
      const predictions = await EmployeePrediction.find(
        { riskLevel: attritionRisk },
        { employeeId: 1, _id: 0 }
      );

      const employeeIdsByRisk = predictions.map(p => p.employeeId);

      if (employeeIdsByRisk.length === 0) {
        return res.json({
          total: 0,
          page,
          limit,
          totalPages: 0,
          employees: []
        });
      }

      employeeFilter.employeeId = { $in: employeeIdsByRisk };
    }

    const [employees, total] = await Promise.all([
      Employee.find(employeeFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Employee.countDocuments(employeeFilter)
    ]);

    // Attach latest prediction data for every employee returned in the page
    const employeeIds = employees.map(e => e.employeeId);
    const latestPredictions = await EmployeePrediction.aggregate([
      { $match: { employeeId: { $in: employeeIds } } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$employeeId",
          riskLevel: { $first: "$riskLevel" },
          probability: { $first: "$probability" },
          factors: { $first: "$factors" }
      }}
    ]);

    const predMap = new Map();
    latestPredictions.forEach(p => predMap.set(p._id, p));

    const enrichedEmployees = employees.map(e => {
      const pred = predMap.get(e.employeeId);
      return {
        ...e,
        riskLevel: pred?.riskLevel || "Low",
        riskScore: pred ? Math.round(pred.probability * 100) : 0,
        factors: pred?.factors || []
      };
    });

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      employees: enrichedEmployees
    });

  } catch (error) {
    console.error("getAllEmployees error:", error);
    res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
  }
};
