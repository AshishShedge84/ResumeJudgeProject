# Resume Judge frontend

Run Flask with `python main.py` from the repository root and open `http://127.0.0.1:5000/ui/`.

The UI posts to `/analyze` on its current origin. When opened directly as a file, it uses `http://127.0.0.1:5000`. An explicitly separate frontend host can set `window.RESUME_JUDGE_API_URL` before loading `script.js`.

Supported files: text-based PDF and DOCX. Legacy `.doc` and scanned PDF/OCR are not supported. Upload progress is illustrative rather than measured server progress. Failed API requests show an error and hide results; there is no automatic sample-data fallback.

The real response contains a predicted `category`, detected `skills`, a numeric keyword-heuristic `score`, string `feedback`, and limitations. Optional structured category bars/feedback remain compatible, but are not fabricated when absent. No GPT, ATS pass-rate, percentile, or hiring-quality claim is made.

The existing layout and styling are preserved. `hero-illustration.js` is a static illustration, not an analysis of an uploaded resume.
