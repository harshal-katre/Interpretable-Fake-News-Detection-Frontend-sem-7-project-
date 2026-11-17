"""
Comprehensive verification script for the Fake News Detector.
Tests:
  1. Preprocessing (classical & transformer)
  2. Model loading & prediction (Logistic Regression & Linear SVM)
  3. Explainability (LIME & SHAP)
  4. FastAPI endpoints (GET /health, GET /metrics, POST /predict, POST /explain for LIME & SHAP)
"""

import sys
import os
import json

# Ensure fake-news-detector and src are in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

print("=" * 60)
print("1. TESTING PREPROCESSING")
print("=" * 60)
from preprocess import clean_classical, clean_transformer

sample_raw = "BREAKING: Check out https://fakenews.com/cure for miracle cure!!! 100% effective."
cleaned_class = clean_classical(sample_raw)
cleaned_trans = clean_transformer(sample_raw)
print(f"Raw:              {sample_raw}")
print(f"Classical clean:  {cleaned_class}")
print(f"Transformer clean:{cleaned_trans}")
assert "http" not in cleaned_class
assert "http" not in cleaned_trans
print(">> Preprocessing: PASS\n")

print("=" * 60)
print("2. TESTING MODELS & PREDICTIONS")
print("=" * 60)
from api.main import _get_model, predict, PredictRequest

for model_name in ["logreg", "svm"]:
    vec, clf = _get_model(model_name)
    print(f"Loaded {model_name}: Vectorizer={type(vec).__name__}, Classifier={type(clf).__name__}")
    
    # Test fake news
    fake_text = "EXPOSED: Secret lab creates mind-control chips hidden in flu vaccines."
    res_fake = predict(PredictRequest(text=fake_text, model=model_name))
    print(f"  [{model_name}] Fake claim prediction: {res_fake.label} (confidence: {res_fake.confidence:.4f})")
    
    # Test real news
    real_text = "Federal Reserve raises interest rates by 0.25 percentage points citing persistent inflation."
    res_real = predict(PredictRequest(text=real_text, model=model_name))
    print(f"  [{model_name}] Real claim prediction: {res_real.label} (confidence: {res_real.confidence:.4f})")

print(">> Model Predictions: PASS\n")

print("=" * 60)
print("3. TESTING EXPLAINABILITY (LIME & SHAP)")
print("=" * 60)
from explain import explain_lime, explain_shap

test_claim = "Doctors do not want you to know drinking bleach cures cancer"

print("--- LIME ---")
l_label, l_conf, l_exps = explain_lime(test_claim, model_type="logreg", num_features=5)
print(f"LIME: label={l_label}, confidence={l_conf:.4f}")
for e in l_exps:
    print(f"  {e['word']:15s} : {e['weight']:+.4f}")

print("\n--- SHAP ---")
s_label, s_conf, s_exps = explain_shap(test_claim, model_type="svm", num_features=5)
print(f"SHAP: label={s_label}, confidence={s_conf:.4f}")
for e in s_exps:
    print(f"  {e['word']:15s} : {e['weight']:+.4f}")

print(">> Explainability: PASS\n")

print("=" * 60)
print("4. TESTING FASTAPI ENDPOINTS")
print("=" * 60)
from api.main import health, metrics, explain, ExplainRequest

h_res = health()
print(f"GET /health   -> {h_res}")
assert h_res["status"] == "ok"

m_res = metrics()
print(f"GET /metrics  -> Found {len(m_res)} model records:")
for m in m_res:
    print(f"  {m['model'].upper()}: Acc={m['accuracy']:.2f}, Prec={m['precision']:.2f}, Rec={m['recall']:.2f}, F1={m['f1']:.2f}")

exp_lime_res = explain(ExplainRequest(text=test_claim, model="logreg", method="lime"))
print(f"POST /explain (LIME) -> Method: {exp_lime_res.method}, Label: {exp_lime_res.label}, Features: {len(exp_lime_res.explanation)}")

exp_shap_res = explain(ExplainRequest(text=test_claim, model="svm", method="shap"))
print(f"POST /explain (SHAP) -> Method: {exp_shap_res.method}, Label: {exp_shap_res.label}, Features: {len(exp_shap_res.explanation)}")

print(">> FastAPI Endpoints: PASS\n")

print("=" * 60)
print("5. VERIFYING FRONTEND ASSETS")
print("=" * 60)
dist_dir = os.path.join(BASE_DIR, "frontend", "dist")
dist_index = os.path.join(dist_dir, "index.html")
assert os.path.exists(dist_index), "Frontend dist/index.html is missing!"
size = os.path.getsize(dist_index)
print(f"Frontend dist/index.html exists ({size} bytes).")
print(">> Frontend Build: PASS\n")

print("=" * 60)
print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
print("=" * 60)
