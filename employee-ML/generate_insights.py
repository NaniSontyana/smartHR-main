import pandas as pd
import numpy as np
import joblib
from utils.data_loader import load_data
from utils.encoder import encode_data

model = joblib.load("model/random_forest_model.pkl")

train_df, test_df = load_data()
train_df, test_df, _ = encode_data(train_df, test_df)

X_test = test_df.drop("Attrition", axis=1)

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

results_df = test_df.copy()
results_df["predicted_attrition"] = y_pred
results_df["attrition_risk"] = y_prob

results_df.to_csv("model/employee_predictions.csv", index=False)

high_risk = results_df[results_df["attrition_risk"] > 0.7]
high_risk.to_csv("model/high_risk_employees.csv", index=False)

feature_importance = pd.DataFrame({
    "feature": X_test.columns,
    "importance": model.feature_importances_
}).sort_values(by="importance", ascending=False)

feature_importance.to_csv("model/feature_importance.csv", index=False)

# Monthly attrition (simulated)
attrition_only = results_df[results_df["Attrition"] == 1].copy()

months = pd.date_range("2024-01-01", "2024-12-01", freq="MS")
np.random.seed(42)
attrition_only["ResignationMonth"] = np.random.choice(months, len(attrition_only))

monthly_attrition = (
    attrition_only
    .groupby(attrition_only["ResignationMonth"].dt.to_period("M"))
    .size()
    .reset_index(name="employees_left")
)

monthly_attrition.to_csv("model/monthly_attrition.csv", index=False)

print("✅ Business insight CSVs generated")
