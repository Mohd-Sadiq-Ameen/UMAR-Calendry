import sqlite3
import os
from config import Config

def get_db_connection():
    os.makedirs(os.path.dirname(Config.DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def add_column_if_missing(table, column, column_type):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [col[1] for col in cursor.fetchall()]
    if column not in columns:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {column_type}")
        conn.commit()
        print(f"✓ Added '{column}' to {table}")
    conn.close()

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            event_type TEXT NOT NULL CHECK(event_type IN ('meeting', 'task')),
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            zoom_link TEXT,
            zoom_meeting_id TEXT,
            provider_id INTEGER,
            booking_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create providers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            service_type TEXT NOT NULL,
            service_name TEXT NOT NULL,
            price INTEGER NOT NULL,
            description TEXT,
            duration INTEGER DEFAULT 60,
            zoom_account_id TEXT,
            city TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create users table (NEW)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'customer',
            provider_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES providers(id)
        )
    ''')
    
    # Create bookings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id TEXT UNIQUE NOT NULL,
            provider_id INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            event_id INTEGER,
            booking_date TEXT NOT NULL,
            booking_time TEXT NOT NULL,
            zoom_link TEXT,
            zoom_meeting_id TEXT,
            status TEXT DEFAULT 'pending',
            payment_status TEXT DEFAULT 'pending',
            amount INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES providers(id),
            FOREIGN KEY (event_id) REFERENCES events(id)
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Add missing columns (for existing databases)
    add_column_if_missing('providers', 'city', 'TEXT')
    
    print("✓ Database initialized successfully")

if __name__ != '__main__':
    init_db()