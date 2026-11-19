# SmartHR Attrition Prediction System - Free Deployment Guide

This guide details how to deploy all three components of the system (React Frontend, Node.js Backend, and Python Flask ML Microservice) to production completely for free.

---

## 🛠️ Prerequisites
1. A **GitHub** account containing your code repository.
2. A **MongoDB Atlas** account (already set up and seeded in the previous steps).
3. A **Render** account (for Backend and ML service).
4. A **Netlify** or **Vercel** account (for Frontend).

---

## 📦 Step 1: Push Your Code to GitHub

If you haven't already pushed your code to GitHub:
1. Initialize git in the root workspace folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of full project"
   ```
2. Create a new repository on GitHub.
3. Link your local project to GitHub and push:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

---

## 🐍 Step 2: Deploy the Python ML Microservice (Render)

Render supports free Python deployments and will automatically install dependencies from `requirements.txt`.

1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following options:
   * **Name**: `employee-attrition-ml` (or any unique name)
   * **Root Directory**: `employee-ML`
   * **Language**: `Python`
   * **Branch**: `main`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `gunicorn app:app`
5. Select the **Free** instance type.
6. Click **Deploy Web Service**.
7. **Copy the URL** of your deployed ML service (e.g., `https://employee-attrition-ml.onrender.com`).

---

## 🚀 Step 3: Deploy the Node.js Backend (Render)

Deploy the Express server as another Web Service on Render.

1. On the Render Dashboard, click **New +** -> **Web Service**.
2. Connect the same GitHub repository.
3. Set the following options:
   * **Name**: `employee-attrition-backend` (or any unique name)
   * **Root Directory**: `employee-backend`
   * **Language**: `Node`
   * **Branch**: `main`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Select the **Free** instance type.
5. Expand the **Advanced** section and click **Add Environment Variable** to add the variables from your local `.env`:
   
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production mode |
   | `MONGO_URI` | `mongodb+srv://<username>:<password>@cluster0.your-subdomain.mongodb.net/?appName=Cluster0` | Connection string to MongoDB Atlas |
   | `JWT_SECRET` | `your_secure_random_string` | Secret key used for signing login tokens |
   | `ML_API_URL` | `https://your-ml-service.onrender.com/predict` | **The URL of your deployed ML service (from Step 2) + `/predict`** |
   | `EMAIL_USER` | `your-email@example.com` | SMTP Email username |
   | `EMAIL_PASS` | `your-app-password` | SMTP App password |
   | `PORT` | `3000` | Port for the server |

6. Click **Deploy Web Service**.
7. **Copy the URL** of your deployed backend service (e.g., `https://employee-attrition-backend.onrender.com`).

---

## 💻 Step 4: Deploy the React Frontend (Netlify or Vercel)

Vite React projects can be built and deployed for free to Netlify or Vercel. We will use Vercel for this guide as it supports easy environment configuration.

### Option A: Deploying on Vercel (Recommended)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the following options:
   * **Root Directory**: `smarthr-attritionrediction-main`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://your-backend-service.onrender.com/api` (The URL of your Node.js backend from Step 3 + `/api`)
6. Click **Deploy**.

### Option B: Deploying on Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Select GitHub and import your repository.
4. Set the following options:
   * **Base directory**: `smarthr-attritionrediction-main`
   * **Build command**: `npm run build`
   * **Publish directory**: `smarthr-attritionrediction-main/dist`
5. Click **Add environment variables** and enter:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://your-backend-service.onrender.com/api`
6. Click **Deploy site**.
7. **Important for Netlify SPAs**: Create a file named `_redirects` inside `smarthr-attritionrediction-main/public` folder with the following content to allow client-side routing to work on refresh:
   ```text
   /*    /index.html   200
   ```

---

## 🔍 Verification & Troubleshooting

### 1. Backend Spin-Up Delay
Since we are using **Render's Free Tier**, backend services automatically go to sleep after 15 minutes of inactivity. The first request to the app can take **~50 seconds** to wake up the server. This is normal on the free tier.

### 2. CORS Errors
The backend has `cors()` enabled globally, which allows any origin to access it. If you want to secure it, you can modify `employee-backend/server.js` in the future to restrict access strictly to your deployed frontend URL.

### 3. IP Access list on MongoDB Atlas
Ensure your MongoDB Atlas Network Security settings are configured to allow access from **anywhere (`0.0.0.0/0`)** since Render's free tier utilizes dynamic outbound IP addresses that change frequently.
* Log into **MongoDB Atlas** -> Go to **Network Access** -> Ensure `0.0.0.0/0` is added to the IP Access List.
