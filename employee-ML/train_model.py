import pandas as pd
import joblib
import os
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# -------------------------------------------------
# BASE PATH
# -------------------------------------------------
BASE_DIR = os.path.dirname(__file__)

# -------------------------------------------------
# LOAD DATA
# -------------------------------------------------
df = pd.read_csv(os.path.join(BASE_DIR, "dataset", "train.csv"))

# -------------------------------------------------
# CLEAN TYPES (CRITICAL)
# -------------------------------------------------
for col in df.columns:
    if df[col].dtype == "bool":
        df[col] = df[col].astype(str)
    elif df[col].dtype == "object":
        df[col] = df[col].astype(str)

# -------------------------------------------------
# TARGET ENCODING
# -------------------------------------------------
df["Attrition"] = (
    df["Attrition"]
    .astype(str)
    .str.lower()
    .map({
        "yes": 1, "left": 1, "true": 1, "1": 1,
        "no": 0, "stayed": 0, "false": 0, "0": 0
    })
)

if df["Attrition"].isna().any():
    raise ValueError("❌ Invalid values in Attrition column")

y = df["Attrition"]
X = df.drop("Attrition", axis=1)

# -------------------------------------------------
# FEATURE SEPARATION
# -------------------------------------------------
categorical_cols = X.select_dtypes(include=["object", "string"]).columns.tolist()
numerical_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()

# -------------------------------------------------
# PREPROCESSOR
# -------------------------------------------------
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", "passthrough", numerical_cols),
    ]
)

# -------------------------------------------------
# MODEL
# -------------------------------------------------
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)

pipeline = Pipeline([
    ("preprocess", preprocessor),
    ("model", model)
])

# -------------------------------------------------
# TRAIN
# -------------------------------------------------
pipeline.fit(X, y)

# -------------------------------------------------
# SAVE PIPELINE
# -------------------------------------------------
os.makedirs(os.path.join(BASE_DIR, "model"), exist_ok=True)

joblib.dump(
    {
        "pipeline": pipeline,
        "categorical_cols": categorical_cols,
        "numerical_cols": numerical_cols
    },
    os.path.join(BASE_DIR, "model", "attrition_pipeline.pkl")
)

print("✅ MODEL TRAINED & SAVED SUCCESSFULLY")
