"""
Explainability module — LIME and SHAP explanations for baseline models.

Usage:
    python src/explain.py --text "some claim" --method lime
    python src/explain.py --text "some claim" --method shap
"""

import argparse
import os
import sys
import joblib
import numpy as np
from lime.lime_text import LimeTextExplainer

sys.path.insert(0, os.path.dirname(__file__))

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def _load_model(model_type: str = "logreg"):
    vec_path = os.path.join(MODELS_DIR, f"tfidf_{model_type}.joblib")
    model_path = os.path.join(MODELS_DIR, f"{model_type}.joblib")
    vectorizer = joblib.load(vec_path)
    model = joblib.load(model_path)
    return vectorizer, model


def _predict_proba_fn(texts, vectorizer, model):
    """
    Return shape (n, 2) probability array.
    Works for LogisticRegression (has predict_proba) and LinearSVC (needs sigmoid wrapper).
    """
    vecs = vectorizer.transform(texts)
    if hasattr(model, "predict_proba"):
        return model.predict_proba(vecs)
    else:
        scores = model.decision_function(vecs)
        proba_fake = sigmoid(scores)
        return np.column_stack([1 - proba_fake, proba_fake])


def explain_lime(text: str, model_type: str = "logreg", num_features: int = 10):
    """
    LIME explanation for a single text.

    Returns:
        label (str): 'fake' or 'real'
        confidence (float): probability of predicted class
        explanations (list[dict]): [{'word': ..., 'weight': ...}, ...]
            Positive weight -> pushes toward fake; negative -> pushes toward real.
    """
    vectorizer, model = _load_model(model_type)
    explainer = LimeTextExplainer(class_names=["real", "fake"])

    predict_fn = lambda texts: _predict_proba_fn(texts, vectorizer, model)

    exp = explainer.explain_instance(
        text, predict_fn, num_features=num_features, num_samples=500
    )

    probas = predict_fn([text])[0]
    pred_class = int(np.argmax(probas))
    label = "fake" if pred_class == 1 else "real"
    confidence = float(probas[pred_class])

    # LIME returns weights for class 1 (fake) by default
    word_weights = exp.as_list(label=1)
    explanations = [{"word": w, "weight": round(wt, 6)} for w, wt in word_weights]

    return label, confidence, explanations


def explain_shap(text: str, model_type: str = "logreg", num_features: int = 10):
    """
    SHAP explanation for a single text.

    Returns same format as explain_lime.
    """
    import shap

    vectorizer, model = _load_model(model_type)
    predict_fn = lambda texts: _predict_proba_fn(texts, vectorizer, model)

    masker = shap.maskers.Text(tokenizer=r"\W+")
    explainer_shap = shap.Explainer(predict_fn, masker, output_names=["real", "fake"])

    shap_values = explainer_shap([text])

    probas = predict_fn([text])[0]
    pred_class = int(np.argmax(probas))
    label = "fake" if pred_class == 1 else "real"
    confidence = float(probas[pred_class])

    # Get SHAP values for class 1 (fake)
    vals = shap_values.values[0, :, 1]
    words = shap_values.data[0]

    pairs = sorted(zip(words, vals), key=lambda x: abs(x[1]), reverse=True)
    explanations = [
        {"word": w, "weight": round(float(wt), 6)}
        for w, wt in pairs[:num_features]
        if w.strip()
    ]

    return label, confidence, explanations


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--method", choices=["lime", "shap"], default="lime")
    parser.add_argument("--model", choices=["logreg", "svm"], default="logreg")
    args = parser.parse_args()

    if args.method == "lime":
        label, conf, exps = explain_lime(args.text, model_type=args.model)
    else:
        label, conf, exps = explain_shap(args.text, model_type=args.model)

    print(f"\nLabel: {label}  |  Confidence: {conf:.4f}")
    print("\nTop contributing words:")
    for e in exps:
        direction = "-> FAKE" if e["weight"] > 0 else "-> REAL"
        print(f"  {e['word']:20s}  {e['weight']:+.6f}  {direction}")
