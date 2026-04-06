import pandas as pd
import joblib
import os
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# -------------------------------------------------
# LOAD MODEL & CONFIG
# -------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "attrition_pipeline.pkl")

print(f"🔄 Loading model from {MODEL_PATH}...")
try:
    pipeline_data = joblib.load(MODEL_PATH)
    # Handle case where joblib dumps a dict vs just the pipeline object
    if isinstance(pipeline_data, dict):
        pipeline = pipeline_data["pipeline"]
        categorical_cols = pipeline_data.get("categorical_cols", [])
        numerical_cols = pipeline_data.get("numerical_cols", [])
    else:
        pipeline = pipeline_data
        # If we just loaded the pipeline, we might need to inspect it to get cols
        # For now, let's assume the dict structure from train_model.py
        categorical_cols = [] 
        numerical_cols = []
        
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    pipeline = None

# -------------------------------------------------
# API ENDPOINTS
# -------------------------------------------------

@app.route('/predict', methods=['POST'])
def predict():
    if pipeline is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Create DataFrame from input
        row = {}
        # We need to construct the row with all expected columns
        # If we have the column lists from the loaded dict, use them
        all_cols = categorical_cols + numerical_cols
        
        # If we didn't get cols from the file, we might be in trouble if the 
        # pipeline expects specific columns.
        # However, `train_model.py` saves a dict, so we should be good.
        
        for col in all_cols:
             row[col] = data.get(col, None)
             
        df = pd.DataFrame([row])

        # -----------------------------
        # FORCE TYPES (Matches predict.py logic)
        # -----------------------------
        for col in categorical_cols:
            df[col] = df[col].fillna("Unknown").astype(str)
            
        for col in numerical_cols:
             df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

        # Predict
        prediction = int(pipeline.predict(df)[0])
        probability = float(pipeline.predict_proba(df)[0][1])

        # Risk Logic
        if probability >= 0.7:
            risk = "High"
        elif probability >= 0.4:
            risk = "Medium"
        else:
            risk = "Low"

        return jsonify({
            "prediction": prediction,
            "probability": round(probability, 2),
            "riskLevel": risk
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "running", "model_loaded": pipeline is not None})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
