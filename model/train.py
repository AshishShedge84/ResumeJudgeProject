import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle

data = pd.read_csv("../dataset/UpdatedResumeDataSet.csv")

X = data["Resume"]
y = data["Category"]

vector = TfidfVectorizer()
Xv = vector.fit_transform(X)

model = LogisticRegression()
model.fit(Xv, y)

pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vector, open("vector.pkl", "wb"))

print("Model trained")