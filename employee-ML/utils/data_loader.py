import pandas as pd

def load_data():
    train_df = pd.read_csv("dataset/train.csv")
    test_df = pd.read_csv("dataset/test.csv")
    return train_df, test_df
