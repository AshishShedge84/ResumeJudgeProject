import sys
import os

# ===== ROOT PATH =====

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

sys.path.insert(0, BASE_DIR)


# ===== IMPORTS =====

from flask import Flask, request, jsonify
from flask_cors import CORS

from utils.parser import extract_text
from utils.skills import get_skills
from utils.score import get_score
from utils.feedback import get_feedback

from model.predict import predict_category


# ===== APP =====

app = Flask(__name__)
CORS(app)


# ===== ROUTE =====

@app.route("/", methods=["GET", "POST"])
def check_resume():

    # browser test
    if request.method == "GET":
        return "Resume Judge Server Running"


    # file check
    if "file" not in request.files:
        return jsonify({"error": "No file"})


    file = request.files["file"]

    # save file
    upload_path = os.path.join(
        BASE_DIR,
        "uploads",
        file.filename
    )

    file.save(upload_path)


    # extract text
    text = extract_text(upload_path)


    # skills
    skills = get_skills(text)


    # category
    category = predict_category(text)


    # score
    score = get_score(skills, category)


    # feedback
    feedback = get_feedback(score)


    return jsonify({
        "category": category,
        "skills": skills,
        "score": score,
        "feedback": feedback
    })


# ===== RUN =====

if __name__ == "__main__":

    print("BASE_DIR =", BASE_DIR)

    app.run(debug=True)