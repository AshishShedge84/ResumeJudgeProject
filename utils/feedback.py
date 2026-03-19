def get_feedback(score):

    if score < 40:
        return "Resume is weak. Add more skills and projects."

    elif score < 70:
        return "Resume is average. Improve experience and skills."

    else:
        return "Resume is strong. Good work."