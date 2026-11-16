import re

skills_list = [
    "python",
    "java",
    "c++",
    "machine learning",
    "ai",
    "data science",
    "sql",
    "html",
    "css",
    "javascript"
]

def get_skills(text):

    found = []

    text = text.lower()

    for s in skills_list:
        if re.search(r"(?<!\w)" + re.escape(s) + r"(?!\w)", text):
            found.append(s)

    return found
