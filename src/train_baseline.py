"""
Train a baseline TF-IDF classifier (Logistic Regression or Linear SVM).

Usage:
    python src/train_baseline.py --model logreg
    python src/train_baseline.py --model svm
"""

import argparse
import os
import sys
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report,
)

# Allow running from project root: python src/train_baseline.py
sys.path.insert(0, os.path.dirname(__file__))
from preprocess import load_dataset

SEED = 42
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def sigmoid(x):
    """Convert SVM decision function values to pseudo-probabilities."""
    return 1 / (1 + np.exp(-x))


def train(model_type: str = "logreg", data_path: str = "data/sample_data.csv"):
    df = load_dataset(data_path, pipeline="classical")
    X, y = df["text"].values, df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=SEED
    )

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    if model_type == "logreg":
        clf = LogisticRegression(
            class_weight="balanced", max_iter=1000, random_state=SEED
        )
    elif model_type == "svm":
        clf = LinearSVC(
            class_weight="balanced", max_iter=5000, random_state=SEED
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")

    clf.fit(X_train_vec, y_train)
    y_pred = clf.predict(X_test_vec)

    # Probabilities for ROC-AUC
    if model_type == "logreg":
        y_proba = clf.predict_proba(X_test_vec)[:, 1]
    else:
        y_proba = sigmoid(clf.decision_function(X_test_vec))

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    try:
        auc = roc_auc_score(y_test, y_proba)
    except ValueError:
        auc = float("nan")
    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=["real", "fake"])

    print(f"\n{'='*50}")
    print(f"Model: {model_type.upper()}")
    print(f"{'='*50}")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC-AUC:   {auc:.4f}")
    print(f"\nConfusion Matrix:\n{cm}")
    print(f"\nClassification Report:\n{report}")

    # Save artefacts
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, f"tfidf_{model_type}.joblib"))
    joblib.dump(clf, os.path.join(MODELS_DIR, f"{model_type}.joblib"))
    print(f"Saved vectorizer and model to {MODELS_DIR}/")

    return {
        "model": model_type,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "roc_auc": auc,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", choices=["logreg", "svm"], default="logreg")
    parser.add_argument("--data", default="data/sample_data.csv")
    args = parser.parse_args()
    train(model_type=args.model, data_path=args.data)
