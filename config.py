from pathlib import Path


class Config:
    BASE_DIR = Path(__file__).resolve().parent
    QUOTES_DATA_PATH = BASE_DIR / "app" / "data" / "quotes.json"
    SECRET_KEY = "replace-in-production"

