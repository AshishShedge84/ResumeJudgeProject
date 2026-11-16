"""Resume analysis API. Uploaded files are temporary and deleted after parsing."""
import os
import sys
import tempfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from utils.parser import extract_text
from utils.skills import get_skills
from utils.score import get_score
from utils.feedback import get_feedback
from model.predict import predict_category

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
CORS(app)


@app.errorhandler(413)
def too_large(error):
    return jsonify({'error': 'Upload must be smaller than 10 MB.'}), 413


@app.route('/ui/')
def frontend():
    return send_from_directory(BASE_DIR / 'frontend', 'index.html')


@app.route('/ui/<path:filename>')
def frontend_asset(filename):
    return send_from_directory(BASE_DIR / 'frontend', filename)


@app.route('/', methods=['GET', 'POST'])
@app.route('/analyze', methods=['POST'])
def check_resume():
    if request.method == 'GET':
        return 'Resume Judge Server Running'
    file = request.files.get('file')
    if file is None or not file.filename:
        return jsonify({'error': 'Choose a resume file.'}), 400
    suffix = Path(file.filename).suffix.lower()
    if suffix not in {'.pdf', '.docx'}:
        return jsonify({'error': 'Only PDF and DOCX files are supported.'}), 415
    upload_path = None
    try:
        # Never trust the browser filename as a server-side path.
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as handle:
            upload_path = handle.name
            file.save(handle)
        try:
            text = extract_text(upload_path)
        except Exception:
            return jsonify({'error': 'Cannot read this document. Use an unencrypted PDF or DOCX with selectable text.'}), 422
        if not text.strip():
            return jsonify({'error': 'No readable text found. Scanned PDFs require OCR, which is not supported.'}), 422
        skills = get_skills(text)
        category = predict_category(text)
        score = get_score(skills, category)
        return jsonify({
            'category': str(category), 'skills': skills, 'score': score,
            'feedback': get_feedback(score),
            'score_type': 'keyword_heuristic',
            'method': 'TF-IDF + Logistic Regression; rule-based skill matching and feedback',
            'limitations': 'This score is a keyword heuristic, not ATS compatibility, hiring probability, or a validated measure of resume quality.',
        })
    except Exception:
        app.logger.exception('Resume analysis failed')
        return jsonify({'error': 'Analysis is unavailable. Check the server and model setup.'}), 503
    finally:
        if upload_path is not None:
            Path(upload_path).unlink(missing_ok=True)


if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_DEBUG') == '1')
