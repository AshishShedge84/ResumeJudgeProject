"""WSGI entrypoint; also supports `python main.py` for local development."""
from backend.app import app

if __name__ == "__main__":
    app.run()
