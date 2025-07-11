import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

class BiasWordFeatures(BaseEstimator, TransformerMixin):
    def __init__(self, bias_words_df):
        self.bias_words_df = bias_words_df
        self.bias_types = sorted(bias_words_df['bias_type'].unique())
        self.male_words = set(bias_words_df[bias_words_df['label'] == 'male']['word'])
        self.female_words = set(bias_words_df[bias_words_df['label'] == 'female']['word'])
        self.bias_word_sets = {
            bias_type: set(bias_words_df[bias_words_df['bias_type'] == bias_type]['word'])
            for bias_type in self.bias_types
        }
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        features = []
        for text in X:
            text_lower = str(text).lower()
            tokens = set(text_lower.split())
            row = []
            # Count male/female-coded words
            row.append(sum(w in tokens for w in self.male_words))
            row.append(sum(w in tokens for w in self.female_words))
            # For each bias type: count and presence flag
            for bias_type in self.bias_types:
                bias_words = self.bias_word_sets[bias_type]
                count = sum(w in tokens for w in bias_words)
                row.append(count)
                row.append(1 if count > 0 else 0)
            features.append(row)
        return np.array(features)

# SentimentFeatures for use in both training and inference
try:
    from textblob import TextBlob
    HAS_TEXTBLOB = True
except ImportError:
    HAS_TEXTBLOB = False
    print("TextBlob not installed: Sentiment features will be skipped.")

class SentimentFeatures(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        if not HAS_TEXTBLOB:
            return np.zeros((len(X), 2))
        features = []
        for text in X:
            blob = TextBlob(str(text))
            features.append([blob.sentiment.polarity, blob.sentiment.subjectivity])
        return np.array(features) 