"""
Train both baseline models and save a comparison table.

Usage:
    python src/evaluate.py
"""

import os
import sys
import pandas as pd

sys.path.insert(0, os.path.dirname(__file__))
from train_baseline import train

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "reports")


def main():
    results = []
    for model_type in ["logreg", "svm"]:
        metrics = train(model_type=model_type)
        results.append(metrics)

    df = pd.DataFrame(results)
    df = df[["model", "accuracy", "precision", "recall", "f1", "roc_auc"]]

    os.makedirs(REPORTS_DIR, exist_ok=True)
    out_path = os.path.join(REPORTS_DIR, "model_comparison.csv")
    df.to_csv(out_path, index=False)
    print(f"\nComparison table saved to {out_path}")
    print(df.to_string(index=False))


if __name__ == "__main__":
    main()
