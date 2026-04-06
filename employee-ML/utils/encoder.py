from sklearn.preprocessing import LabelEncoder

def encode_data(train_df, test_df):
    label_encoders = {}

    for col in train_df.select_dtypes(include="object"):
        le = LabelEncoder()
        train_df[col] = le.fit_transform(train_df[col])
        test_df[col] = le.transform(test_df[col])
        label_encoders[col] = le

    return train_df, test_df, label_encoders
