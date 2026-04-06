import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import os

# Load dataset
df = pd.read_csv("dataset/train.csv")

X = df.drop("Attrition", axis=1)
y = df["Attrition"]

# Identify column types
categorical_cols = X.select_dtypes(include=["object", "string"]).columns
numerical_cols = X.select_dtypes(exclude="object").columns


OneHotEncoder(handle_unknown="ignore", sparse_output=False)

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", "passthrough", numerical_cols),
    ]
)

# Model
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)

# Pipeline
pipeline = Pipeline(
    steps=[
        ("preprocess", preprocessor),
        ("model", model)
    ]
)

# Train
pipeline.fit(X, y)

# Save pipeline
BASE_DIR = os.path.dirname(__file__)
os.makedirs(os.path.join(BASE_DIR, "model"), exist_ok=True)

joblib.dump(pipeline, os.path.join(BASE_DIR, "model", "attrition_pipeline.pkl"))

print("✅ attrition_pipeline.pkl created successfully")
