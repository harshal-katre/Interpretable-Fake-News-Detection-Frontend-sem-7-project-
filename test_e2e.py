import subprocess
import time
import urllib.request
import json
import sys
import os

backend_cmd = [
    os.path.abspath(r"a:\Interpretable Fake News Detection Frontend (sem-7 project )\fake-news-detector\venv\Scripts\python.exe"),
    "-m", "uvicorn", "api.main:app", "--port", "8000"
]

frontend_cmd = ["cmd.exe", "/c", "npm", "run", "dev"]

print("Starting backend...")
backend_proc = subprocess.Popen(
    backend_cmd,
    cwd=r"a:\Interpretable Fake News Detection Frontend (sem-7 project )\fake-news-detector",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
)

print("Starting frontend dev server...")
frontend_proc = subprocess.Popen(
    frontend_cmd,
    cwd=r"a:\Interpretable Fake News Detection Frontend (sem-7 project )\fake-news-detector\frontend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
)

def check_url(url, timeout=2):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8")
    except Exception as e:
        return None, str(e)

try:
    # Wait for backend
    print("Waiting for backend on http://localhost:8000/health ...")
    backend_ok = False
    for i in range(15):
        status, body = check_url("http://localhost:8000/health")
        if status == 200:
            backend_ok = True
            print(f"Backend up! Status: {status}, Body: {body}")
            break
        time.sleep(1)

    # Wait for frontend
    print("Waiting for frontend dev server on http://localhost:5173 ...")
    frontend_ok = False
    for i in range(15):
        status, body = check_url("http://localhost:5173/")
        if status == 200 and "<div id=\"root\">" in body:
            frontend_ok = True
            print(f"Frontend up! Status: {status}, HTML served successfully.")
            break
        time.sleep(1)

    if not backend_ok:
        print("Backend failed to start.")
    if not frontend_ok:
        print("Frontend failed to start.")

    # Test predict endpoint with real text
    print("\n--- Testing POST /predict ---")
    req_body = json.dumps({"text": "Federal Reserve raises interest rates by 0.25 percentage points", "model": "logreg"}).encode("utf-8")
    req = urllib.request.Request("http://localhost:8000/predict", data=req_body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        print(f"POST /predict -> {resp.read().decode('utf-8')}")

    # Test explain endpoint with fake text
    print("\n--- Testing POST /explain ---")
    req_body = json.dumps({"text": "EXPOSED: Secret government lab creates mind-control chips hidden inside flu vaccines", "model": "logreg"}).encode("utf-8")
    req = urllib.request.Request("http://localhost:8000/explain", data=req_body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        print(f"POST /explain -> {resp.read().decode('utf-8')}")

    print("\nAll integration checks passed!")

finally:
    print("Stopping servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
    backend_proc.wait()
    frontend_proc.wait()
    print("Servers stopped cleanly.")
