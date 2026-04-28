import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    # Zoom API
    ZOOM_CLIENT_ID = os.getenv('ZOOM_CLIENT_ID', '')
    ZOOM_CLIENT_SECRET = os.getenv('ZOOM_CLIENT_SECRET', '')
    ZOOM_ACCOUNT_ID = os.getenv('ZOOM_ACCOUNT_ID', '')
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')