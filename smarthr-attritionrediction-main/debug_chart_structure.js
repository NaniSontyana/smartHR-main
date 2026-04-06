
import React from 'react';
import { DepartmentChart } from './src/components/dashboard/DepartmentChart';

// Mock data to test the component in isolation
const mockData = [
    { department: 'Sales', Low: 10, Medium: 5, High: 2, value: 17, name: 'Sales' },
    { department: 'R&D', Low: 20, Medium: 2, High: 1, value: 23, name: 'R&D' },
    { department: 'HR', Low: 5, Medium: 1, High: 0, value: 6, name: 'HR' }
];

console.log("Mock Data:", JSON.stringify(mockData, null, 2));
// In a real browser environment we would render this, but here we just check structure
console.log("Data keys:", Object.keys(mockData[0]));
