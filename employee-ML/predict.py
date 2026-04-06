import sys
import json
import joblib
import pandas as pd
import os
import numpy as np

# -----------------------------
# Load trained pipeline
# -----------------------------
BASE_DIR = os.path.dirname(__file__)
pipeline = joblib.load(os.path.join(BASE_DIR, "model", "attrition_pipeline.pkl"))

# -----------------------------
# Read input JSON
# -----------------------------
input_data = json.loads(sys.stdin.read())

# -----------------------------
# Build full row using training columns
# -----------------------------
all_columns = pipeline.categorical_cols + pipeline.numerical_cols

row = {}
for col in all_columns:
    row[col] = input_data.get(col, None)

df = pd.DataFrame([row])

# -----------------------------
# FORCE TYPES (🔥 CRITICAL FIX 🔥)
# -----------------------------

# Categorical → string
for col in pipeline.categorical_cols:
    df[col] = df[col].fillna("Unknown").astype(str)

# Numerical → float
for col in pipeline.numerical_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

# -----------------------------
# Predict
# -----------------------------
prediction = int(pipeline.predict(df)[0])
probability = float(pipeline.predict_proba(df)[0][1])

# Risk label
if probability >= 0.7:
    risk = "High"
elif probability >= 0.4:
    risk = "Medium"
else:
    risk = "Low"

# -----------------------------
# Output
# -----------------------------
print(json.dumps({
    "prediction": prediction,
    "probability": round(probability, 2),
    "riskLevel": risk
}))
