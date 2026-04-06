import joblib
import pandas as pd

bundle = joblib.load("model/attrition_pipeline.pkl")

# Extract the actual pipeline
pipeline = bundle["pipeline"]

# Now this will work
feature_names = pipeline.feature_names_in_

print("Model trained on features:")
print(feature_names)