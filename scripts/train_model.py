# scripts/train_model.py
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline, FeatureUnion
from server.bias_features import BiasWordFeatures, SentimentFeatures
from sklearn.metrics import classification_report
import numpy as np

# --- Load Data ---
df = pd.read_csv("data/biascheck_dataset_labeled_cleaned.csv")
df = df.dropna(subset=["text", "label"])
bias_words_df = pd.read_csv("data/corrected_gender_dataset.csv")

# --- Split ---
X_train, X_test, y_train, y_test = train_test_split(
    df['text'], df['label'], test_size=0.2, stratify=df['label'], random_state=42
)

# --- Feature Union ---
feature_union = FeatureUnion([
    ("tfidf", TfidfVectorizer(max_features=2000, stop_words="english")),
    ("bias_words", BiasWordFeatures(bias_words_df)),
    ("sentiment", SentimentFeatures()),
])

# --- Model Pipeline ---
model = Pipeline([
    ("features", feature_union),
    ("clf", LogisticRegression(max_iter=2000, class_weight="balanced")),
])

# --- Train and Evaluate ---
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print("Classification Report:\n", classification_report(y_test, y_pred))

# --- Save ---
joblib.dump(model, "model/bias_model.pkl")
print("✅ Model saved to model/bias_model.pkl")

# --- Label Distribution ---
print("Label distribution in full dataset:")
print(df['label'].value_counts())
