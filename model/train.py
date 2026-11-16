"""Train a resume classifier with a reproducible, duplicate-free holdout."""

import argparse
import json
import pickle
from pathlib import Path

import pandas as pd
import sklearn
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]


def prepare_data(data):
    missing = {"Resume", "Category"} - set(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    data = data.dropna(subset=["Resume", "Category"]).copy()
    data["Resume"] = data["Resume"].astype(str).str.strip()
    data["Category"] = data["Category"].astype(str).str.strip()
    data = data[(data.Resume != "") & (data.Category != "")]
    data["_key"] = data.Resume.str.lower().str.replace(r"\s+", " ", regex=True)
    if data.groupby("_key").Category.nunique().gt(1).any():
        raise ValueError("Identical resume text has conflicting category labels.")
    return data.drop_duplicates("_key").reset_index(drop=True)


def train(dataset, output_dir, test_size=0.2, random_state=42):
    raw = pd.read_csv(dataset)
    data = prepare_data(raw)
    if data.Category.nunique() < 2 or data.Category.value_counts().min() < 2:
        raise ValueError("At least two categories with two unique resumes each are required.")
    training, test = train_test_split(
        data, test_size=test_size, random_state=random_state, stratify=data.Category
    )
    vector = TfidfVectorizer()
    # Fit vocabulary/IDF exclusively on training rows, never the holdout.
    x_train = vector.fit_transform(training.Resume)
    x_test = vector.transform(test.Resume)
    model = LogisticRegression(max_iter=1000, random_state=random_state)
    model.fit(x_train, training.Category)
    predicted = model.predict(x_test)
    baseline = DummyClassifier(strategy="most_frequent").fit(x_train, training.Category)
    baseline_predicted = baseline.predict(x_test)
    report = {
        "dataset": Path(dataset).name,
        "source_rows": len(raw),
        "unique_valid_rows": len(data),
        "removed_rows": len(raw) - len(data),
        "train_rows": len(training),
        "test_rows": len(test),
        "classes": sorted(data.Category.unique().tolist()),
        "random_state": random_state,
        "test_size": test_size,
        "scikit_learn_version": sklearn.__version__,
        "accuracy": accuracy_score(test.Category, predicted),
        "macro_f1": f1_score(test.Category, predicted, average="macro", zero_division=0),
        "baseline_accuracy": accuracy_score(test.Category, baseline_predicted),
        "baseline_macro_f1": f1_score(test.Category, baseline_predicted, average="macro", zero_division=0),
        "per_class": classification_report(test.Category, predicted, output_dict=True, zero_division=0),
        "limitations": "Single stratified holdout on a small public dataset; not evidence of production hiring quality. Near-duplicate and external validation remain future work.",
    }
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    for filename, artifact in [("model.pkl", model), ("vector.pkl", vector)]:
        with (output_dir / filename).open("wb") as handle:
            pickle.dump(artifact, handle)
    (output_dir / "evaluation.json").write_text(json.dumps(report, indent=2) + "\n")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=ROOT / "dataset/UpdatedResumeDataSet.csv")
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()
    print(json.dumps(train(args.dataset, args.output_dir), indent=2))
