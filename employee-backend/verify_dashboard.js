import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const verifyDashboard = async () => {
    try {
        console.log("Checking Dashboard Endpoint...");
        try {
            await axios.get(`${API_URL}/dashboard`);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log("SUCCESS: Dashboard returned 401 Unauthorized (Correct behavior without token).");
                console.log("This confirms the server is NOT crashing.");
                return;
            }
            throw error; // Re-throw if not 401
        }
    } catch (error) {
        console.error("VERIFICATION FAILED:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
};

verifyDashboard();

