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
        if s in text:
            found.append(s)

    return found