def get_score(skills, category):

    score = 0

    # skills score
    score += len(skills) * 5

    # category score
    if category:
        score += 30

    # limit
    if score > 100:
        score = 100

    return score