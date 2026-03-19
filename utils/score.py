def get_score(skills, category):

    score = 0

    # skills score
    score += len(skills) * 5

    # category score
    if category is not None:
        score += 30

    # max limit
    if score > 100:
        score = 100

    return score