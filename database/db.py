import sqlite3
import os


DATABASE = "database/app.db"


def get_db_connection():
    os.makedirs("database", exist_ok=True)

    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row

    return connection


def init_db():
    connection = get_db_connection()

    # =========================
    # FARMERS
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS farmers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            village TEXT NOT NULL,
            district TEXT NOT NULL,
            state TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # =========================
    # CROPS
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS crops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            crop_name TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            season TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers(id)
        )
    """)

    # =========================
    # PROCUREMENT CENTRES
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS centres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            district TEXT NOT NULL,
            state TEXT NOT NULL,
            operating_hours TEXT,
            daily_capacity INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # =========================
    # PROCUREMENT SCHEDULES
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            centre_id INTEGER NOT NULL,
            crop_name TEXT NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            capacity INTEGER NOT NULL,
            booked_slots INTEGER DEFAULT 0,
            status TEXT DEFAULT 'OPEN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (centre_id) REFERENCES centres(id)
        )
    """)

    # =========================
    # BOOKINGS
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            crop_id INTEGER NOT NULL,
            centre_id INTEGER NOT NULL,
            schedule_id INTEGER NOT NULL,
            token_number INTEGER NOT NULL,
            status TEXT DEFAULT 'BOOKED',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers(id),
            FOREIGN KEY (crop_id) REFERENCES crops(id),
            FOREIGN KEY (centre_id) REFERENCES centres(id),
            FOREIGN KEY (schedule_id) REFERENCES schedules(id)
        )
    """)

    # =========================
    # QUEUE EVENTS
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS queue_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            queue_position INTEGER,
            people_ahead INTEGER,
            check_in_time TEXT,
            service_start_time TEXT,
            completed_time TEXT,
            actual_waiting_minutes REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id)
        )
    """)

    # =========================
    # USERS / AUTH
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'FARMER',
            farmer_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers(id)
        )
    """)

    # =========================
    # PAYMENTS
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_status TEXT DEFAULT 'PENDING',
            payment_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id)
        )
    """)

    # =========================
    # NOTIFICATIONS
    # =========================
    connection.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            notification_type TEXT DEFAULT 'GENERAL',
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES farmers(id)
        )
    """)

    connection.commit()
    connection.close()

