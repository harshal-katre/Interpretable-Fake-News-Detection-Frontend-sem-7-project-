"""
FastAPI backend for the Fake News Detector.

Endpoints:
    GET  /health   -> {"status": "ok"}
    POST /predict  -> {"label": ..., "confidence": ...}
    POST /explain  -> {"label": ..., "confidence": ..., "explanation": [...]}
"""

import os
import sys

# Add src/ to path so we can import project modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI(title="Fake News Detector API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lazy-loaded model cache ──
_loaded_models = {}
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def _get_model(model_type: str):
    """Load vectorizer + classifier on first use; cache for subsequent calls."""
    if model_type in _loaded_models:
        return _loaded_models[model_type]

    import joblib

    vec_path = os.path.join(MODELS_DIR, f"tfidf_{model_type}.joblib")
    model_path = os.path.join(MODELS_DIR, f"{model_type}.joblib")

    if not os.path.exists(vec_path) or not os.path.exists(model_path):
        raise HTTPException(
            status_code=503,
            detail=(
                f"Model '{model_type}' not found. "
                f"Run 'python src/train_baseline.py --model {model_type}' first."
            ),
        )

    vectorizer = joblib.load(vec_path)
    model = joblib.load(model_path)
    _loaded_models[model_type] = (vectorizer, model)
    return vectorizer, model


# ── Request / Response schemas ──

class PredictRequest(BaseModel):
    text: str
    model: Optional[str] = Field(default="logreg", description="Model to use: logreg, svm")


class ExplainRequest(BaseModel):
    text: str
    model: Optional[str] = Field(default="logreg", description="Model to use: logreg, svm")
    method: Optional[str] = Field(default="lime", description="Explanation method: lime, shap")


class PredictResponse(BaseModel):
    label: str
    confidence: float


class ExplainWordWeight(BaseModel):
    word: str
    weight: float


class ExplainResponse(BaseModel):
    label: str
    confidence: float
    method: Optional[str] = "lime"
    explanation: list[ExplainWordWeight]


# ── Endpoints ──

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    import pandas as pd
    report_path = os.path.join(os.path.dirname(__file__), "..", "reports", "model_comparison.csv")
    if not os.path.exists(report_path):
        return []
    df = pd.read_csv(report_path)
    return df.to_dict(orient="records")


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    import numpy as np
    from preprocess import clean_classical

    vectorizer, model = _get_model(req.model)
    cleaned = clean_classical(req.text)
    vec = vectorizer.transform([cleaned])

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(vec)[0]
    else:
        from train_baseline import sigmoid
        score = model.decision_function(vec)[0]
        p_fake = sigmoid(score)
        proba = [1 - p_fake, p_fake]

    pred_class = int(np.argmax(proba))
    return PredictResponse(
        label="fake" if pred_class == 1 else "real",
        confidence=round(float(proba[pred_class]), 4),
    )


@app.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest):
    _get_model(req.model)  # Validate model exists first

    method = (req.method or "lime").lower()
    if method == "shap":
        from explain import explain_shap
        label, confidence, explanations = explain_shap(
            req.text, model_type=req.model, num_features=10
        )
    elif method == "lime":
        from explain import explain_lime
        label, confidence, explanations = explain_lime(
            req.text, model_type=req.model, num_features=10
        )
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported explanation method '{req.method}'. Choose 'lime' or 'shap'."
        )

    return ExplainResponse(
        label=label,
        confidence=round(confidence, 4),
        method=method,
        explanation=[
            ExplainWordWeight(word=e["word"], weight=e["weight"])
            for e in explanations
        ],
    )
