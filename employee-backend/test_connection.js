import axios from 'axios';

const testConnection = async () => {
    try {
        console.log("Testing root endpoint...");
        const root = await axios.get('http://localhost:3000/');
        console.log("Root status:", root.status, root.data);

        console.log("Testing dashboard stats endpoint...");
        const dashboard = await axios.get('http://localhost:3000/api/dashboard');
        console.log("Dashboard status:", dashboard.status);
        console.log("Dashboard data keys:", Object.keys(dashboard.data));
    } catch (error) {
        console.error("Connection failed:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
    }
};

testConnection();
