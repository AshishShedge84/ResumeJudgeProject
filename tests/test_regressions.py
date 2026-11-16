import io
import json
import pickle
from pathlib import Path

import pandas as pd
import pytest
from docx import Document
from sklearn.model_selection import train_test_split

from backend.app import app
from model.train import prepare_data, train
from utils.skills import get_skills


@pytest.fixture
def client():
    app.config.update(TESTING=True)
    return app.test_client()


def document_bytes():
    out = io.BytesIO()
    document = Document()
    document.add_paragraph('Python SQL machine learning projects and experience')
    document.save(out)
    out.seek(0)
    return out


def test_word_boundaries():
    assert get_skills('email javascript html') == ['html', 'javascript']
    assert get_skills('Python, SQL; C++ and AI.') == ['python', 'c++', 'ai', 'sql']


def test_missing_upload(client):
    assert client.post('/analyze').status_code == 400


def test_unsupported_upload(client):
    result = client.post('/analyze', data={'file': (io.BytesIO(b'bad'), 'resume.doc')})
    assert result.status_code == 415


def test_invalid_pdf_and_cleanup(client, monkeypatch, tmp_path):
    monkeypatch.setattr('tempfile.tempdir', str(tmp_path))
    result = client.post('/analyze', data={'file': (io.BytesIO(b'bad'), '../../resume.pdf')})
    assert result.status_code == 422
    assert not list(tmp_path.iterdir())


@pytest.mark.parametrize('route', ['/', '/analyze'])
def test_docx_analysis_contract(client, route, monkeypatch, tmp_path):
    monkeypatch.setattr('tempfile.tempdir', str(tmp_path))
    monkeypatch.setattr('backend.app.predict_category', lambda text: 'Data Science')
    result = client.post(route, data={'file': (document_bytes(), '../../resume.docx')})
    assert result.status_code == 200
    assert result.json['category'] == 'Data Science'
    assert isinstance(result.json['feedback'], str)  # legacy API compatibility
    assert result.json['score_type'] == 'keyword_heuristic'
    assert not list(tmp_path.iterdir())


def test_cleanup_after_prediction_error(client, monkeypatch, tmp_path):
    monkeypatch.setattr('tempfile.tempdir', str(tmp_path))
    def fail(text):
        raise RuntimeError('Unavailable model')
    monkeypatch.setattr('backend.app.predict_category', fail)
    result = client.post('/analyze', data={'file': (document_bytes(), 'resume.docx')})
    assert result.status_code == 503
    assert not list(tmp_path.iterdir())


def test_empty_document(client):
    out = io.BytesIO()
    Document().save(out)
    out.seek(0)
    assert client.post('/analyze', data={'file': (out, 'empty.docx')}).status_code == 422


def test_size_limit(client):
    result = client.post('/analyze', data={'file': (io.BytesIO(b'x' * (10 * 1024 * 1024)), 'large.pdf')})
    assert result.status_code == 413


def test_real_model_and_ui(client):
    result = client.post('/analyze', data={'file': (document_bytes(), 'resume.docx')})
    assert result.status_code == 200
    assert result.json['category']
    assert client.get('/ui/').status_code == 200
    assert client.get('/ui/hero-illustration.js').status_code == 200
    assert client.get('/ui/script.js').status_code == 200


def test_duplicate_and_conflicting_labels():
    data = pd.DataFrame({'Resume': ['Python  SQL', ' python sql ', 'java'], 'Category': ['A', 'A', 'B']})
    assert len(prepare_data(data)) == 2
    data.loc[1, 'Category'] = 'B'
    with pytest.raises(ValueError, match='conflicting'):
        prepare_data(data)


def test_training_excludes_holdout_vocabulary(tmp_path):
    data = pd.DataFrame({
        'Resume': [f'python analyst uniqueterm{i}' for i in range(10)] + [f'java developer uniqueterm{i}' for i in range(10, 20)],
        'Category': ['A'] * 10 + ['B'] * 10,
    })
    dataset = tmp_path / 'resumes.csv'
    pd.concat([data, data.iloc[:3]]).to_csv(dataset, index=False)
    report = train(dataset, tmp_path / 'artifacts')
    assert report['source_rows'] == 23
    assert report['unique_valid_rows'] == 20
    _, heldout = train_test_split(prepare_data(data), test_size=0.2, random_state=42, stratify=data.Category)
    with (tmp_path / 'artifacts/vector.pkl').open('rb') as f:
        vector = pickle.load(f)
    for text in heldout.Resume:
        assert text.split()[-1] not in vector.vocabulary_
    assert json.loads((tmp_path / 'artifacts/evaluation.json').read_text())['test_rows'] == 4
