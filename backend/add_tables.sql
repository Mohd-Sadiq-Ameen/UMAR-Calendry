-- Providers table (for service providers like teachers, doctors, etc.)
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (for customer bookings)
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
);