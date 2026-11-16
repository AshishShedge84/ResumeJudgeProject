# Resume Judge AI

A student project that extracts PDF/DOCX resume text, predicts one of 25 job categories with TF-IDF + Logistic Regression, and returns matched skill keywords with a simple rule-based score and feedback.

**Scope:** No GPT/LLM service is used. The score is a keyword heuristic, not an ATS score, hiring probability, or validated measure of resume quality. Scanned documents need external OCR. Keyword matching is deliberately small and does not infer proficiency or target-job gaps.

## Run locally (Python 3.11–3.14)

macOS/Linux:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python main.py
```

Windows PowerShell:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

Open **http://127.0.0.1:5000/ui/**. Flask serves the existing frontend and API from one origin. If port 5000 is occupied (for example by AirPlay on macOS), run `python -m flask --app main run --port 5050` and open `http://127.0.0.1:5050/ui/`.

`GET /` remains a health message. `POST /analyze` and legacy `POST /` accept a multipart `file` (PDF or DOCX; request limit 10 MiB). Responses retain `category`, `skills`, numeric `score`, and string `feedback`, with `score_type`, `method` and `limitations` added. The UI shows genuine server errors rather than generated demo results.

Uploads are stored under randomized temporary names and deleted after parsing, including failures. Existing files committed under `uploads/` predate this change; do not upload sensitive resumes or assume historical git data has been removed. There are no cloud model calls. Production hosting still needs deployment-specific controls such as authentication, rate limiting, resource limits, TLS and restricted CORS.

## Model evaluation

The original training script fitted all 962 rows with no holdout. After normalized exact-text deduplication there are **166 unique resumes** (796 repeated rows removed). The new script fits vocabulary and IDF only on training data, uses a stratified 80/20 split with seed 42, and reports accuracy, macro-F1, per-class results and a most-frequent-class baseline.

```sh
# Evaluate into a separate directory, preserving the currently shipped artifacts:
python model/train.py --output-dir evaluation_run
# Explicitly replace model/model.pkl and model/vector.pkl if desired:
python model/train.py
```

The run recorded in [docs/evaluation.json](docs/evaluation.json) used scikit-learn 1.8.0, 132 training rows and **34 holdout rows**, giving **50.0% accuracy and 0.305 macro-F1** versus **8.82% accuracy** for the baseline. These are results for that evaluated split model, not a measurement of the pre-existing shipped pickle artifacts. The shipped artifacts are preserved; their scikit-learn version is pinned for compatibility.

The holdout has only 1–3 examples per class, so estimates are unstable. Near-duplicate detection, a larger licensed dataset and external validation are still needed. No production-quality claim is made. Pickle can execute code: load only trusted artifacts.

## Checks

```sh
python -m pip install pytest
python -m pytest -q
node --check frontend/script.js
node tests/frontend.test.cjs
```

Regression checks cover duplicate/conflicting labels, holdout vocabulary leakage, PDF/DOCX handling, legacy and current API routes, malformed/empty/oversized uploads, temporary-file cleanup, skill word boundaries and real-model inference. Browser-level appearance and production deployment are separate checks.

## Layout

- `backend/app.py`: API, temporary uploads and frontend serving
- `main.py`: local/WSGI entrypoint
- `model/train.py`: reproducible training/evaluation
- `model/predict.py`: existing classifier inference
- `utils/`: parsing, keyword matching, heuristic scoring and feedback
- `frontend/`: existing HTML/CSS/JavaScript interface
- `tests/`: regression checks

No spaCy language model download is needed; runtime skill matching uses a keyword list.
