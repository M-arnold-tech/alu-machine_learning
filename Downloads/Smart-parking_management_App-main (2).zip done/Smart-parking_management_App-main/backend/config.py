import os

# Database configuration (use environment variables in production)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "smart_spaces")
DB_PORT = int(os.getenv("DB_PORT", 3306))

# App configuration
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-prod")

# Optionally load from a .env file if present (developer convenience)
try:
	from dotenv import load_dotenv
	load_dotenv()
except Exception:
	# python-dotenv is optional; environment variables will still work
	pass
