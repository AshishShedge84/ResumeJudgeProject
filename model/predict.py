import pickle
import os

BASE_DIR = os.path.dirname(__file__)

model_path = os.path.join(BASE_DIR, "model.pkl")
vector_path = os.path.join(BASE_DIR, "vector.pkl")

print("MODEL PATH =", model_path)
print("VECTOR PATH =", vector_path)

model = pickle.load(open(model_path, "rb"))
vector = pickle.load(open(vector_path, "rb"))


def predict_category(text):

    v = vector.transform([text])

    p = model.predict(v)

    return p[0]