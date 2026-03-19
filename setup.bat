echo Installing libraries...

pip install -r requirements.txt

echo Installing spacy model...

python -m spacy download en_core_web_sm

echo Done

pause