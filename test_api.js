import axios from 'axios';

const API_URL = 'http://localhost:3000/api/dashboard/high-risk';

async function testApi() {
    try {
        const response = await axios.get(API_URL);
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response Status:", error.response.status);
            console.error("Response Data:", error.response.data);
        }
    }
}

testApi();
