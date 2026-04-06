import joblib
from sklearn.metrics import accuracy_score, classification_report
from utils.data_loader import load_data
from utils.encoder import encode_data

model = joblib.load("model/random_forest_model.pkl")

train_df, test_df = load_data()
train_df, test_df, _ = encode_data(train_df, test_df)

X_test = test_df.drop("Attrition", axis=1)
y_test = test_df["Attrition"]

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))
