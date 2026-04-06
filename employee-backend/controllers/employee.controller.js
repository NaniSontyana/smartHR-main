import Employee from '../models/Employee.model.js';
import EmployeePrediction from '../models/EmployeePrediction.model.js';

export const addEmployee = async (req, res) => {
  try {
    // Get all schema fields except Mongo internal ones
    const requiredFields = Object.keys(Employee.schema.paths)
      .filter(
        field =>
          !['_id', '__v', 'createdAt', 'updatedAt'].includes(field)
      );

    // Find missing fields
    const missingFields = requiredFields.filter(
      field => req.body[field] === undefined || req.body[field] === null
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Required fields missing',
        missingFields
      });
    }

    const employee = await Employee.create(req.body);

    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add employee' });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { department, jobRole, attritionRisk } = req.query;

    const employeeFilter = {};

    if (department) {
      employeeFilter.department = department;
    }

    if (jobRole) {
      employeeFilter.jobRole = jobRole;
    }

    let employeeIDsByRisk = null;

    if (attritionRisk) {
      const predictions = await EmployeePrediction.find(
        { attritionRisk },
        { employeeID: 1, _id: 0 }
      );

      employeeIDsByRisk = predictions.map(p => p.employeeID);

      if (employeeIDsByRisk.length === 0) {
        return res.json({
          total: 0,
          page,
          limit,
          employees: []
        });
      }

      employeeFilter.employeeID = { $in: employeeIDsByRisk };
    }

    const employees = await Employee.find(employeeFilter)
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(employeeFilter);

    res.json({
      total,
      page,
      limit,
      employees
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};


