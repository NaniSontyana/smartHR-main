import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Apply dark mode from localStorage before render
if (localStorage.getItem("hrmate-dark-mode") === "true") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(<App />);
