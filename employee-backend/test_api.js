import axios from "axios";

const checkData = async () => {
    try {
        console.log("Fetching dashboard stats from http://localhost:3000/api/dashboard?period=monthly");
        const response = await axios.get("http://localhost:3000/api/dashboard?period=monthly");
        console.log("✅ API Success! Status:", response.status);
        console.log("Data keys:", Object.keys(response.data));
    } catch (error) {
        console.error("❌ API Failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
};

checkData();
