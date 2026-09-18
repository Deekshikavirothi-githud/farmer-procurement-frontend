import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database.db import get_db_connection, init_db
from auth import hash_password, verify_password, create_access_token, decode_access_token
from ml_model import predict_waiting_time, model_exists, train_model

app = FastAPI(
    title="Farmer Procurement Intelligence System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# =========================================================
# MODELS
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    phone: str
    password: str
    village: str
    district: str
    state: str


class LoginRequest(BaseModel):
    phone: str
    password: str


class CropCreate(BaseModel):
    crop_name: str
    quantity: float
    unit: str
    season: Optional[str] = None


class CentreCreate(BaseModel):
    name: str
    location: str
    district: str
    state: str
    operating_hours: Optional[str] = None
    daily_capacity: int


class ScheduleCreate(BaseModel):
    centre_id: int
    crop_name: str
    date: str
    start_time: str
    end_time: str
    capacity: int


class BookingCreate(BaseModel):
    crop_id: int
    schedule_id: int


class BookingStatusUpdate(BaseModel):
    status: str


# =========================================================
# HELPERS / AUTH
# =========================================================

ALLOWED_STATUSES = [
    "BOOKED",
    "CHECK-IN",
    "IN QUEUE",
    "PROCESSING",
    "UNDER VERIFICATION",
    "ACCEPTED",
    "REJECTED",
    "COMPLETED",
    "CANCELLED",
]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required.")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    token = authorization.replace("Bearer ", "", 1)
    payload = decode_access_token(token)

    if not payload or not payload.get("user_id"):
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    connection = get_db_connection()
    user = connection.execute(
        "SELECT id, phone, role, farmer_id FROM users WHERE id = ?",
        (payload["user_id"],),
    ).fetchone()
    connection.close()

    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    return dict(user)


def require_farmer(current_user=Depends(get_current_user)):
    if current_user["role"] != "FARMER":
        raise HTTPException(status_code=403, detail="Farmer access required.")
    return current_user


def require_admin(current_user=Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user


def create_notification(connection, farmer_id, title, message, notification_type="GENERAL"):
    connection.execute(
        """
        INSERT INTO notifications
        (farmer_id, title, message, notification_type)
        VALUES (?, ?, ?, ?)
        """,
        (farmer_id, title, message, notification_type),
    )


def calculate_queue_metrics(connection, booking):
    active_statuses = (
        "BOOKED",
        "CHECK-IN",
        "IN QUEUE",
        "PROCESSING",
        "UNDER VERIFICATION",
    )

    people_ahead = connection.execute(
        """
        SELECT COUNT(*)
        FROM bookings
        WHERE centre_id = ?
          AND schedule_id = ?
          AND id < ?
          AND status IN (?, ?, ?, ?, ?)
        """,
        (
            booking["centre_id"],
            booking["schedule_id"],
            booking["id"],
            *active_statuses,
        ),
    ).fetchone()[0]

    return people_ahead + 1, people_ahead


# =========================================================
# BASIC
# =========================================================

@app.get("/")
def root():
    return {
        "project": "Farmer Procurement Intelligence System",
        "status": "Backend is running",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


# =========================================================
# AUTH
# =========================================================

@app.post("/api/auth/register")
def register(data: RegisterRequest):
    connection = get_db_connection()

    existing = connection.execute(
        "SELECT id FROM users WHERE phone = ?",
        (data.phone,),
    ).fetchone()

    if existing:
        connection.close()
        raise HTTPException(status_code=400, detail="Phone number already registered.")

    connection.execute(
        """
        INSERT INTO farmers
        (name, phone, village, district, state)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            data.name,
            data.phone,
            data.village,
            data.district,
            data.state,
        ),
    )

    farmer = connection.execute(
        "SELECT id FROM farmers WHERE phone = ?",
        (data.phone,),
    ).fetchone()

    connection.execute(
        """
        INSERT INTO users
        (phone, password_hash, role, farmer_id)
        VALUES (?, ?, 'FARMER', ?)
        """,
        (
            data.phone,
            hash_password(data.password),
            farmer["id"],
        ),
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "Farmer account created successfully.",
    }


@app.post("/api/auth/login")
def login(data: LoginRequest):
    connection = get_db_connection()

    user = connection.execute(
        """
        SELECT id, phone, password_hash, role, farmer_id
        FROM users
        WHERE phone = ?
        """,
        (data.phone,),
    ).fetchone()

    connection.close()

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid phone number or password.",
        )

    token = create_access_token(
        {
            "user_id": user["id"],
            "role": user["role"],
            "farmer_id": user["farmer_id"],
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "farmer_id": user["farmer_id"],
    }


@app.get("/api/auth/me")
def me(current_user=Depends(get_current_user)):
    return current_user


# =========================================================
# FARMER PROFILE
# =========================================================

@app.get("/api/farmer/profile")
def farmer_profile(current_user=Depends(require_farmer)):
    connection = get_db_connection()

    farmer = connection.execute(
        "SELECT * FROM farmers WHERE id = ?",
        (current_user["farmer_id"],),
    ).fetchone()

    connection.close()

    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found.")

    return dict(farmer)


# =========================================================
# CROPS
# =========================================================

@app.post("/api/farmer/crops")
def create_crop(data: CropCreate, current_user=Depends(require_farmer)):
    if data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero.",
        )

    connection = get_db_connection()

    connection.execute(
        """
        INSERT INTO crops
        (farmer_id, crop_name, quantity, unit, season)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            current_user["farmer_id"],
            data.crop_name,
            data.quantity,
            data.unit,
            data.season,
        ),
    )

    connection.commit()
    crop_id = connection.execute(
        "SELECT last_insert_rowid()"
    ).fetchone()[0]
    connection.close()

    return {
        "success": True,
        "crop_id": crop_id,
        "message": "Crop registered successfully.",
    }


@app.get("/api/farmer/crops")
def get_crops(current_user=Depends(require_farmer)):
    connection = get_db_connection()

    crops = connection.execute(
        """
        SELECT *
        FROM crops
        WHERE farmer_id = ?
        ORDER BY id DESC
        """,
        (current_user["farmer_id"],),
    ).fetchall()

    connection.close()

    return [dict(crop) for crop in crops]


# =========================================================
# CENTRES
# =========================================================

@app.post("/api/centres")
def create_centre(data: CentreCreate, current_user=Depends(require_admin)):
    if data.daily_capacity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Daily capacity must be greater than zero.",
        )

    connection = get_db_connection()

    connection.execute(
        """
        INSERT INTO centres
        (name, location, district, state, operating_hours, daily_capacity)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            data.name,
            data.location,
            data.district,
            data.state,
            data.operating_hours,
            data.daily_capacity,
        ),
    )

    connection.commit()
    centre_id = connection.execute(
        "SELECT last_insert_rowid()"
    ).fetchone()[0]
    connection.close()

    return {
        "success": True,
        "centre_id": centre_id,
        "message": "Procurement centre created successfully.",
    }


@app.get("/api/centres")
def get_centres():
    connection = get_db_connection()

    centres = connection.execute(
        "SELECT * FROM centres ORDER BY id DESC"
    ).fetchall()

    connection.close()

    return [dict(centre) for centre in centres]


# =========================================================
# SCHEDULES
# =========================================================

@app.post("/api/schedules")
def create_schedule(data: ScheduleCreate, current_user=Depends(require_admin)):
    if data.capacity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Capacity must be greater than zero.",
        )

    connection = get_db_connection()

    centre = connection.execute(
        "SELECT id FROM centres WHERE id = ?",
        (data.centre_id,),
    ).fetchone()

    if not centre:
        connection.close()
        raise HTTPException(status_code=404, detail="Centre not found.")

    connection.execute(
        """
        INSERT INTO schedules
        (centre_id, crop_name, date, start_time, end_time, capacity, booked_slots, status)
        VALUES (?, ?, ?, ?, ?, ?, 0, 'OPEN')
        """,
        (
            data.centre_id,
            data.crop_name,
            data.date,
            data.start_time,
            data.end_time,
            data.capacity,
        ),
    )

    connection.commit()
    schedule_id = connection.execute(
        "SELECT last_insert_rowid()"
    ).fetchone()[0]
    connection.close()

    return {
        "success": True,
        "schedule_id": schedule_id,
        "message": "Procurement schedule published successfully.",
    }


@app.get("/api/schedules")
def get_schedules():
    connection = get_db_connection()

    schedules = connection.execute(
        """
        SELECT
            s.*,
            c.name AS centre_name,
            c.location AS location,
            c.district AS district,
            c.state AS state
        FROM schedules s
        JOIN centres c ON s.centre_id = c.id
        ORDER BY s.date ASC, s.start_time ASC, s.id DESC
        """
    ).fetchall()

    connection.close()

    return [dict(schedule) for schedule in schedules]


# =========================================================
# BOOKINGS
# =========================================================

@app.post("/api/bookings")
def create_booking(data: BookingCreate, current_user=Depends(require_farmer)):
    connection = get_db_connection()

    crop = connection.execute(
        """
        SELECT * FROM crops
        WHERE id = ? AND farmer_id = ?
        """,
        (data.crop_id, current_user["farmer_id"]),
    ).fetchone()

    if not crop:
        connection.close()
        raise HTTPException(status_code=404, detail="Crop not found for this farmer.")

    schedule = connection.execute(
        """
        SELECT
            s.*,
            c.name AS centre_name,
            c.location AS centre_location,
            c.district AS centre_district,
            c.state AS centre_state
        FROM schedules s
        JOIN centres c ON s.centre_id = c.id
        WHERE s.id = ?
        """,
        (data.schedule_id,),
    ).fetchone()

    if not schedule:
        connection.close()
        raise HTTPException(status_code=404, detail="Procurement schedule not found.")

    if schedule["crop_name"].strip().lower() != crop["crop_name"].strip().lower():
        connection.close()
        raise HTTPException(
            status_code=400,
            detail="Selected crop does not match this procurement schedule.",
        )

    if schedule["status"] != "OPEN":
        connection.close()
        raise HTTPException(status_code=400, detail="This procurement schedule is not open.")

    booked_slots = schedule["booked_slots"] or 0
    capacity = schedule["capacity"] or 0

    if booked_slots >= capacity:
        connection.close()
        raise HTTPException(status_code=400, detail="This procurement schedule is full.")

    existing = connection.execute(
        """
        SELECT id FROM bookings
        WHERE farmer_id = ?
          AND schedule_id = ?
          AND status NOT IN ('COMPLETED', 'REJECTED', 'CANCELLED')
        """,
        (current_user["farmer_id"], data.schedule_id),
    ).fetchone()

    if existing:
        connection.close()
        raise HTTPException(
            status_code=400,
            detail="You already have an active booking for this schedule.",
        )

    token = booked_slots + 1

    cursor = connection.execute(
        """
        INSERT INTO bookings
        (farmer_id, crop_id, centre_id, schedule_id, token_number, status)
        VALUES (?, ?, ?, ?, ?, 'BOOKED')
        """,
        (
            current_user["farmer_id"],
            data.crop_id,
            schedule["centre_id"],
            data.schedule_id,
            token,
        ),
    )

    booking_id = cursor.lastrowid

    connection.execute(
        """
        UPDATE schedules
        SET booked_slots = booked_slots + 1
        WHERE id = ?
        """,
        (data.schedule_id,),
    )

    connection.execute(
        """
        INSERT INTO queue_events
        (booking_id, queue_position, people_ahead)
        VALUES (?, ?, ?)
        """,
        (booking_id, token, max(0, token - 1)),
    )

    create_notification(
        connection,
        current_user["farmer_id"],
        "Booking Confirmed",
        f"Your procurement slot is confirmed at {schedule['centre_name']}. Your token is #{token}.",
        "BOOKING",
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "id": booking_id,
        "booking_id": booking_id,
        "token_number": token,
        "status": "BOOKED",
        "centre_id": schedule["centre_id"],
        "centre_name": schedule["centre_name"],
        "schedule_id": schedule["id"],
        "crop_id": data.crop_id,
        "date": schedule["date"],
        "start_time": schedule["start_time"],
        "end_time": schedule["end_time"],
        "capacity": capacity,
        "booked_slots": booked_slots + 1,
        "people_ahead": max(0, token - 1),
    }


@app.get("/api/farmer/bookings")
def get_farmer_bookings(current_user=Depends(require_farmer)):
    connection = get_db_connection()

    bookings = connection.execute(
        """
        SELECT
            b.*,
            c.name AS centre_name,
            c.location AS centre_location,
            c.district AS centre_district,
            s.crop_name AS scheduled_crop,
            s.date AS schedule_date,
            s.start_time,
            s.end_time,
            s.capacity,
            s.booked_slots,
            cr.crop_name,
            cr.quantity,
            cr.unit,
            q.queue_position,
            q.people_ahead,
            q.check_in_time,
            q.service_start_time,
            q.completed_time,
            q.actual_waiting_minutes,
            p.amount,
            p.payment_status,
            p.payment_date
        FROM bookings b
        JOIN centres c ON b.centre_id = c.id
        JOIN schedules s ON b.schedule_id = s.id
        JOIN crops cr ON b.crop_id = cr.id
        LEFT JOIN queue_events q
            ON q.id = (
                SELECT MAX(q2.id)
                FROM queue_events q2
                WHERE q2.booking_id = b.id
            )
        LEFT JOIN payments p
            ON p.id = (
                SELECT MAX(p2.id)
                FROM payments p2
                WHERE p2.booking_id = b.id
            )
        WHERE b.farmer_id = ?
        ORDER BY b.id DESC
        """,
        (current_user["farmer_id"],),
    ).fetchall()

    connection.close()

    return [dict(booking) for booking in bookings]


@app.get("/api/bookings/{booking_id}")
def get_booking(booking_id: int, current_user=Depends(get_current_user)):
    connection = get_db_connection()

    booking = connection.execute(
        """
        SELECT
            b.*,
            f.name AS farmer_name,
            f.phone AS farmer_phone,
            c.name AS centre_name,
            c.location AS centre_location,
            s.crop_name AS scheduled_crop,
            s.date AS schedule_date,
            s.start_time,
            s.end_time,
            cr.crop_name,
            cr.quantity,
            cr.unit
        FROM bookings b
        JOIN farmers f ON b.farmer_id = f.id
        JOIN centres c ON b.centre_id = c.id
        JOIN schedules s ON b.schedule_id = s.id
        JOIN crops cr ON b.crop_id = cr.id
        WHERE b.id = ?
        """,
        (booking_id,),
    ).fetchone()

    connection.close()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    if (
        current_user["role"] == "FARMER"
        and booking["farmer_id"] != current_user["farmer_id"]
    ):
        raise HTTPException(status_code=403, detail="Access denied.")

    return dict(booking)


# =========================================================
# STATUS / LIVE QUEUE
# =========================================================

@app.patch("/api/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    current_user=Depends(require_admin),
):
    new_status = data.status.strip().upper()

    if new_status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {', '.join(ALLOWED_STATUSES)}",
        )

    connection = get_db_connection()

    booking = connection.execute(
        "SELECT * FROM bookings WHERE id = ?",
        (booking_id,),
    ).fetchone()

    if not booking:
        connection.close()
        raise HTTPException(status_code=404, detail="Booking not found.")

    old_status = booking["status"]
    current_time = now_iso()

    latest = connection.execute(
        """
        SELECT *
        FROM queue_events
        WHERE booking_id = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (booking_id,),
    ).fetchone()

    check_in_time = latest["check_in_time"] if latest else None
    service_start_time = latest["service_start_time"] if latest else None
    completed_time = latest["completed_time"] if latest else None
    actual_wait = latest["actual_waiting_minutes"] if latest else None

    if new_status == "CHECK-IN" and not check_in_time:
        check_in_time = current_time

    if new_status in ("PROCESSING", "UNDER VERIFICATION") and not service_start_time:
        service_start_time = current_time

        if check_in_time:
            try:
                start = datetime.fromisoformat(check_in_time)
                end = datetime.fromisoformat(current_time)
                actual_wait = round(
                    max(0, (end - start).total_seconds() / 60),
                    1,
                )
            except ValueError:
                actual_wait = None

    if new_status == "COMPLETED":
        completed_time = current_time

    position, people_ahead = calculate_queue_metrics(connection, booking)

    connection.execute(
        """
        UPDATE bookings
        SET status = ?
        WHERE id = ?
        """,
        (new_status, booking_id),
    )

    connection.execute(
        """
        INSERT INTO queue_events
        (
            booking_id,
            queue_position,
            people_ahead,
            check_in_time,
            service_start_time,
            completed_time,
            actual_waiting_minutes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            booking_id,
            position,
            people_ahead,
            check_in_time,
            service_start_time,
            completed_time,
            actual_wait,
        ),
    )

    create_notification(
        connection,
        booking["farmer_id"],
        "Procurement Status Updated",
        f"Booking status changed from {old_status} to {new_status}.",
        "STATUS",
    )

    if new_status == "COMPLETED":
        payment = connection.execute(
            "SELECT id FROM payments WHERE booking_id = ?",
            (booking_id,),
        ).fetchone()

        if not payment:
            connection.execute(
                """
                INSERT INTO payments
                (booking_id, amount, payment_status)
                VALUES (?, 0, 'PENDING')
                """,
                (booking_id,),
            )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "booking_id": booking_id,
        "old_status": old_status,
        "status": new_status,
    }


@app.get("/api/admin/queue")
def get_admin_queue(current_user=Depends(require_admin)):
    connection = get_db_connection()

    bookings = connection.execute(
        """
        SELECT
            b.id,
            b.token_number,
            b.status,
            b.created_at,
            f.name AS farmer_name,
            f.phone AS farmer_phone,
            cr.crop_name,
            cr.quantity,
            cr.unit,
            c.name AS centre_name,
            c.location AS centre_location,
            s.date AS schedule_date,
            s.start_time,
            s.end_time,
            q.queue_position,
            q.people_ahead,
            q.check_in_time,
            q.service_start_time,
            q.actual_waiting_minutes
        FROM bookings b
        JOIN farmers f ON b.farmer_id = f.id
        JOIN crops cr ON b.crop_id = cr.id
        JOIN centres c ON b.centre_id = c.id
        JOIN schedules s ON b.schedule_id = s.id
        LEFT JOIN queue_events q
            ON q.id = (
                SELECT MAX(q2.id)
                FROM queue_events q2
                WHERE q2.booking_id = b.id
            )
        WHERE b.status NOT IN ('COMPLETED', 'REJECTED', 'CANCELLED')
        ORDER BY b.token_number ASC
        """
    ).fetchall()

    connection.close()

    return [dict(booking) for booking in bookings]


# =========================================================
# DASHBOARD
# =========================================================

@app.get("/api/dashboard")
def dashboard(current_user=Depends(get_current_user)):
    connection = get_db_connection()

    if current_user["role"] == "ADMIN":
        total_bookings = connection.execute(
            "SELECT COUNT(*) FROM bookings"
        ).fetchone()[0]

        active_bookings = connection.execute(
            """
            SELECT COUNT(*)
            FROM bookings
            WHERE status NOT IN ('COMPLETED', 'REJECTED', 'CANCELLED')
            """
        ).fetchone()[0]

        completed = connection.execute(
            "SELECT COUNT(*) FROM bookings WHERE status = 'COMPLETED'"
        ).fetchone()[0]

        processing = connection.execute(
            """
            SELECT COUNT(*)
            FROM bookings
            WHERE status IN ('PROCESSING', 'UNDER VERIFICATION')
            """
        ).fetchone()[0]

        connection.close()

        return {
            "role": "ADMIN",
            "total_bookings": total_bookings,
            "active_bookings": active_bookings,
            "completed": completed,
            "processing": processing,
        }

    farmer_id = current_user["farmer_id"]

    total_crops = connection.execute(
        "SELECT COUNT(*) FROM crops WHERE farmer_id = ?",
        (farmer_id,),
    ).fetchone()[0]

    total_bookings = connection.execute(
        "SELECT COUNT(*) FROM bookings WHERE farmer_id = ?",
        (farmer_id,),
    ).fetchone()[0]

    active_bookings = connection.execute(
        """
        SELECT COUNT(*)
        FROM bookings
        WHERE farmer_id = ?
          AND status NOT IN ('COMPLETED', 'REJECTED', 'CANCELLED')
        """,
        (farmer_id,),
    ).fetchone()[0]

    connection.close()

    return {
        "role": "FARMER",
        "total_crops": total_crops,
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
    }



# =========================================================
# ADMIN CENTRES
# =========================================================

@app.get("/api/admin/centres")
def get_admin_centres(current_user=Depends(require_admin)):
    connection = get_db_connection()

    centres = connection.execute(
        """
        SELECT
            c.id,
            c.name,
            c.location,
            c.district,
            c.state,
            c.operating_hours,
            c.daily_capacity,
            COUNT(b.id) AS total_bookings
        FROM centres c
        LEFT JOIN bookings b ON c.id = b.centre_id
        GROUP BY
            c.id, c.name, c.location, c.district, c.state,
            c.operating_hours, c.daily_capacity
        ORDER BY c.id DESC
        """
    ).fetchall()

    connection.close()

    result = []

    for centre in centres:
        item = dict(centre)
        capacity = item["daily_capacity"] or 0
        bookings = item["total_bookings"] or 0
        item["utilisation"] = round(min(100, (bookings / capacity) * 100), 1) if capacity > 0 else 0
        result.append(item)

    return result



# =========================================================
# AI WAIT-TIME PREDICTION
# =========================================================

@app.get("/api/bookings/{booking_id}/prediction")
def get_waiting_time_prediction(
    booking_id: int,
    current_user=Depends(get_current_user),
):
    connection = get_db_connection()

    booking = connection.execute(
        """
        SELECT
            b.id,
            b.farmer_id,
            b.centre_id,
            b.schedule_id,
            b.status,
            s.capacity,
            s.booked_slots,
            q.people_ahead
        FROM bookings b
        JOIN schedules s ON b.schedule_id = s.id
        LEFT JOIN queue_events q
            ON q.id = (
                SELECT MAX(q2.id)
                FROM queue_events q2
                WHERE q2.booking_id = b.id
            )
        WHERE b.id = ?
        """,
        (booking_id,),
    ).fetchone()

    connection.close()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    if (
        current_user["role"] == "FARMER"
        and booking["farmer_id"] != current_user["farmer_id"]
    ):
        raise HTTPException(status_code=403, detail="Access denied.")

    people_ahead = booking["people_ahead"] or 0

    if not model_exists():
        return {
            "booking_id": booking["id"],
            "model_ready": False,
            "predicted_waiting_minutes": None,
            "source": "MODEL_NOT_TRAINED",
            "message": (
                "Waiting-time prediction will appear after enough "
                "real queue history is collected."
            ),
            "people_ahead": people_ahead,
        }

    prediction = predict_waiting_time(
        people_ahead=people_ahead,
        centre_id=booking["centre_id"],
        capacity=booking["capacity"],
        booked_slots=booking["booked_slots"],
    )

    return {
        "booking_id": booking["id"],
        "model_ready": True,
        "predicted_waiting_minutes": prediction,
        "source": "ML_MODEL",
        "people_ahead": people_ahead,
    }


@app.post("/api/admin/ml/train")
def train_waiting_time_model(current_user=Depends(require_admin)):
    success = train_model()

    if not success:
        raise HTTPException(
            status_code=400,
            detail=(
                "Not enough real queue history. "
                "At least 5 completed waiting-time records are required."
            ),
        )

    return {
        "success": True,
        "message": "Waiting-time ML model trained successfully.",
    }


@app.get("/api/admin/ml/status")
def get_ml_status(current_user=Depends(require_admin)):
    return {
        "model_ready": model_exists(),
        "model_file": "waiting_time_model.pkl",
    }


# =========================================================
# NOTIFICATIONS
# =========================================================

@app.get("/api/farmer/notifications")
def get_notifications(current_user=Depends(require_farmer)):
    connection = get_db_connection()

    notifications = connection.execute(
        """
        SELECT *
        FROM notifications
        WHERE farmer_id = ?
        ORDER BY id DESC
        LIMIT 50
        """,
        (current_user["farmer_id"],),
    ).fetchall()

    connection.close()

    return [dict(item) for item in notifications]


@app.patch("/api/farmer/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user=Depends(require_farmer),
):
    connection = get_db_connection()

    result = connection.execute(
        """
        UPDATE notifications
        SET is_read = 1
        WHERE id = ?
          AND farmer_id = ?
        """,
        (notification_id, current_user["farmer_id"]),
    )

    connection.commit()
    connection.close()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Notification not found.")

    return {"success": True}


# =========================================================
# PAYMENTS
# =========================================================

@app.get("/api/farmer/payments")
def get_farmer_payments(current_user=Depends(require_farmer)):
    connection = get_db_connection()

    payments = connection.execute(
        """
        SELECT
            p.*,
            b.token_number,
            b.status AS booking_status,
            c.name AS centre_name,
            cr.crop_name
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN centres c ON b.centre_id = c.id
        JOIN crops cr ON b.crop_id = cr.id
        WHERE b.farmer_id = ?
        ORDER BY p.id DESC
        """,
        (current_user["farmer_id"],),
    ).fetchall()

    connection.close()

    return [dict(payment) for payment in payments]


@app.patch("/api/admin/payments/{booking_id}")
def update_payment(
    booking_id: int,
    payment_status: str,
    amount: float = 0,
    current_user=Depends(require_admin),
):
    allowed = {"PENDING", "PROCESSING", "PAID", "FAILED"}
    payment_status = payment_status.upper()

    if payment_status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid payment status.")

    connection = get_db_connection()

    booking = connection.execute(
        "SELECT farmer_id FROM bookings WHERE id = ?",
        (booking_id,),
    ).fetchone()

    if not booking:
        connection.close()
        raise HTTPException(status_code=404, detail="Booking not found.")

    payment = connection.execute(
        "SELECT id FROM payments WHERE booking_id = ?",
        (booking_id,),
    ).fetchone()

    if payment:
        connection.execute(
            """
            UPDATE payments
            SET amount = ?,
                payment_status = ?,
                payment_date = CASE
                    WHEN ? = 'PAID' THEN ?
                    ELSE payment_date
                END
            WHERE booking_id = ?
            """,
            (
                amount,
                payment_status,
                payment_status,
                now_iso(),
                booking_id,
            ),
        )
    else:
        connection.execute(
            """
            INSERT INTO payments
            (booking_id, amount, payment_status, payment_date)
            VALUES (?, ?, ?, ?)
            """,
            (
                booking_id,
                amount,
                payment_status,
                now_iso() if payment_status == "PAID" else None,
            ),
        )

    create_notification(
        connection,
        booking["farmer_id"],
        "Payment Status Updated",
        f"Payment status: {payment_status}.",
        "PAYMENT",
    )

    connection.commit()
    connection.close()

    return {
        "success": True,
        "booking_id": booking_id,
        "payment_status": payment_status,
    }


# =========================================================
# ADMIN FARMERS
# =========================================================

@app.get("/api/admin/farmers")
def get_admin_farmers(current_user=Depends(require_admin)):
    connection = get_db_connection()
    farmers = connection.execute(
        """
        SELECT
            f.id,
            f.name,
            f.phone,
            f.village,
            f.district,
            f.state,
            f.created_at,
            COUNT(DISTINCT cr.id) AS crop_count,
            COUNT(DISTINCT b.id) AS booking_count
        FROM farmers f
        LEFT JOIN crops cr ON cr.farmer_id = f.id
        LEFT JOIN bookings b ON b.farmer_id = f.id
        GROUP BY f.id, f.name, f.phone, f.village, f.district, f.state, f.created_at
        ORDER BY f.id DESC
        """
    ).fetchall()
    connection.close()
    return [dict(item) for item in farmers]


# =========================================================
# ADMIN SCHEDULE MANAGEMENT
# =========================================================

@app.get("/api/admin/schedules")
def get_admin_schedules(current_user=Depends(require_admin)):
    connection = get_db_connection()
    schedules = connection.execute(
        """
        SELECT
            s.id,
            s.centre_id,
            s.crop_name,
            s.date,
            s.start_time,
            s.end_time,
            s.capacity,
            s.booked_slots,
            s.status,
            c.name AS centre_name,
            c.location,
            c.district,
            c.state
        FROM schedules s
        LEFT JOIN centres c ON s.centre_id = c.id
        ORDER BY s.date DESC, s.start_time ASC, s.id DESC
        """
    ).fetchall()
    connection.close()
    return [dict(item) for item in schedules]


@app.post("/api/admin/schedules")
def create_admin_schedule(data: ScheduleCreate, current_user=Depends(require_admin)):
    if data.capacity <= 0:
        raise HTTPException(status_code=400, detail="Schedule capacity must be greater than zero.")
    if data.start_time >= data.end_time:
        raise HTTPException(status_code=400, detail="End time must be later than start time.")

    connection = get_db_connection()
    centre = connection.execute(
        "SELECT id, name, daily_capacity FROM centres WHERE id = ?",
        (data.centre_id,),
    ).fetchone()

    if not centre:
        connection.close()
        raise HTTPException(status_code=404, detail="Procurement centre not found.")

    if centre["daily_capacity"] and data.capacity > centre["daily_capacity"]:
        connection.close()
        raise HTTPException(
            status_code=400,
            detail=f"Schedule capacity cannot exceed centre daily capacity of {centre['daily_capacity']}",
        )

    duplicate = connection.execute(
        """
        SELECT id FROM schedules
        WHERE centre_id = ? AND crop_name = ? AND date = ?
          AND start_time = ? AND end_time = ?
        """,
        (data.centre_id, data.crop_name, data.date, data.start_time, data.end_time),
    ).fetchone()

    if duplicate:
        connection.close()
        raise HTTPException(status_code=409, detail="A schedule with the same details already exists.")

    cursor = connection.execute(
        """
        INSERT INTO schedules
        (centre_id, crop_name, date, start_time, end_time, capacity, booked_slots, status)
        VALUES (?, ?, ?, ?, ?, ?, 0, 'OPEN')
        """,
        (data.centre_id, data.crop_name.strip(), data.date, data.start_time, data.end_time, data.capacity),
    )
    schedule_id = cursor.lastrowid
    connection.commit()
    connection.close()

    return {"success": True, "message": "Procurement schedule created successfully", "schedule_id": schedule_id, "status": "OPEN"}


@app.delete("/api/admin/schedules/{schedule_id}")
def delete_admin_schedule(schedule_id: int, current_user=Depends(require_admin)):
    connection = get_db_connection()
    schedule = connection.execute("SELECT id FROM schedules WHERE id = ?", (schedule_id,)).fetchone()
    if not schedule:
        connection.close()
        raise HTTPException(status_code=404, detail="Schedule not found.")

    bookings = connection.execute(
        "SELECT COUNT(*) AS count FROM bookings WHERE schedule_id = ?",
        (schedule_id,),
    ).fetchone()["count"]

    if bookings > 0:
        connection.close()
        raise HTTPException(status_code=400, detail="This schedule already has bookings. It cannot be deleted.")

    connection.execute("DELETE FROM schedules WHERE id = ?", (schedule_id,))
    connection.commit()
    connection.close()
    return {"success": True, "message": "Schedule deleted successfully"}


# =========================================================
# FARMER LIVE QUEUE
# =========================================================

@app.get("/api/bookings/{booking_id}/queue")
def get_booking_queue(booking_id: int, current_user=Depends(get_current_user)):
    connection = get_db_connection()
    booking = connection.execute(
        """
        SELECT
            b.id,
            b.farmer_id,
            b.centre_id,
            b.schedule_id,
            b.token_number,
            b.status,
            c.name AS centre_name,
            c.location AS centre_location,
            s.date,
            s.start_time,
            s.end_time,
            s.capacity,
            s.booked_slots
        FROM bookings b
        JOIN centres c ON b.centre_id = c.id
        JOIN schedules s ON b.schedule_id = s.id
        WHERE b.id = ?
        """,
        (booking_id,),
    ).fetchone()

    if not booking:
        connection.close()
        raise HTTPException(status_code=404, detail="Booking not found.")

    if current_user["role"] == "FARMER" and booking["farmer_id"] != current_user["farmer_id"]:
        connection.close()
        raise HTTPException(status_code=403, detail="Access denied.")

    position, people_ahead = calculate_queue_metrics(connection, booking)

    latest = connection.execute(
        """
        SELECT * FROM queue_events
        WHERE booking_id = ?
        ORDER BY id DESC LIMIT 1
        """,
        (booking_id,),
    ).fetchone()

    predicted = predict_waiting_time(
        people_ahead=people_ahead,
        centre_id=booking["centre_id"],
        capacity=booking["capacity"] or 0,
        booked_slots=booking["booked_slots"] or 0,
    ) if model_exists() else None

    connection.close()

    return {
        "booking_id": booking["id"],
        "token_number": booking["token_number"],
        "status": booking["status"],
        "queue_position": position,
        "people_ahead": people_ahead,
        "predicted_waiting_time": predicted,
        "predicted_waiting_minutes": predicted,
        "ai_available": model_exists(),
        "centre_name": booking["centre_name"],
        "centre_location": booking["centre_location"],
        "date": booking["date"],
        "start_time": booking["start_time"],
        "end_time": booking["end_time"],
        "capacity": booking["capacity"],
        "booked_slots": booking["booked_slots"],
        "check_in_time": latest["check_in_time"] if latest else None,
        "service_start_time": latest["service_start_time"] if latest else None,
        "completed_time": latest["completed_time"] if latest else None,
        "actual_waiting_minutes": latest["actual_waiting_minutes"] if latest else None,
    }


# =========================================================
# SMART PROCUREMENT RECOMMENDATIONS
# =========================================================

@app.get("/api/smart-procurement")
def smart_procurement(current_user=Depends(require_farmer)):
    connection = get_db_connection()
    crops = connection.execute(
        "SELECT crop_name FROM crops WHERE farmer_id = ? ORDER BY id DESC",
        (current_user["farmer_id"],),
    ).fetchall()

    crop_names = [item["crop_name"].strip().lower() for item in crops]

    schedules = connection.execute(
        """
        SELECT
            s.*,
            c.name AS centre_name,
            c.location,
            c.district,
            c.state
        FROM schedules s
        JOIN centres c ON s.centre_id = c.id
        WHERE s.status = 'OPEN'
          AND s.booked_slots < s.capacity
        ORDER BY s.date ASC, s.start_time ASC
        """
    ).fetchall()

    recommendations = []

    for item in schedules:
        crop_match = item["crop_name"].strip().lower() in crop_names
        remaining = max(0, (item["capacity"] or 0) - (item["booked_slots"] or 0))
        load = (item["booked_slots"] / item["capacity"] * 100) if item["capacity"] else 100
        people_ahead = item["booked_slots"] or 0

        predicted = predict_waiting_time(
            people_ahead=people_ahead,
            centre_id=item["centre_id"],
            capacity=item["capacity"],
            booked_slots=item["booked_slots"],
        ) if model_exists() else None

        availability_score = min(100, (remaining / max(1, item["capacity"])) * 100)
        load_score = max(0, 100 - load)
        wait_score = max(0, 100 - min(100, ((predicted or people_ahead * 5) / 120) * 100))

        score = (
            availability_score * 0.40
            + load_score * 0.25
            + wait_score * 0.35
        )

        if crop_match:
            score += 10

        recommendations.append({
            "schedule_id": item["id"],
            "centre_id": item["centre_id"],
            "centre_name": item["centre_name"],
            "location": item["location"],
            "district": item["district"],
            "state": item["state"],
            "crop_name": item["crop_name"],
            "date": item["date"],
            "start_time": item["start_time"],
            "end_time": item["end_time"],
            "capacity": item["capacity"],
            "booked_slots": item["booked_slots"],
            "remaining_slots": remaining,
            "predicted_waiting_time": predicted,
            "recommendation_score": round(min(100, score), 1),
            "crop_match": crop_match,
            "ai_available": model_exists(),
        })

    connection.close()
    recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)

    return {
        "success": True,
        "ai_available": model_exists(),
        "recommendations": recommendations[:10],
    }


# =========================================================
# ADMIN ANALYTICS
# =========================================================

@app.get("/api/admin/analytics")
def get_admin_analytics(current_user=Depends(require_admin)):
    connection = get_db_connection()

    total_farmers = connection.execute("SELECT COUNT(*) AS count FROM farmers").fetchone()["count"]
    total_crops = connection.execute("SELECT COUNT(*) AS count FROM crops").fetchone()["count"]
    total_centres = connection.execute("SELECT COUNT(*) AS count FROM centres").fetchone()["count"]
    total_schedules = connection.execute("SELECT COUNT(*) AS count FROM schedules").fetchone()["count"]
    total_bookings = connection.execute("SELECT COUNT(*) AS count FROM bookings").fetchone()["count"]
    completed_bookings = connection.execute("SELECT COUNT(*) AS count FROM bookings WHERE status = 'COMPLETED'").fetchone()["count"]
    active_bookings = connection.execute("""
        SELECT COUNT(*) AS count FROM bookings
        WHERE status IN ('BOOKED', 'CHECK-IN', 'IN QUEUE', 'PROCESSING', 'UNDER VERIFICATION')
    """).fetchone()["count"]

    payment_summary = connection.execute("""
        SELECT
            COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END), 0) AS paid_amount,
            COALESCE(SUM(CASE WHEN payment_status != 'PAID' THEN amount ELSE 0 END), 0) AS pending_amount
        FROM payments
    """).fetchone()

    waiting_summary = connection.execute("""
        SELECT COUNT(*) AS records,
               COALESCE(AVG(actual_waiting_minutes), 0) AS average_waiting_time
        FROM queue_events
        WHERE actual_waiting_minutes IS NOT NULL
    """).fetchone()

    crop_demand = connection.execute("""
        SELECT s.crop_name, COUNT(*) AS booking_count
        FROM bookings b
        JOIN schedules s ON b.schedule_id = s.id
        GROUP BY s.crop_name
        ORDER BY booking_count DESC
        LIMIT 10
    """).fetchall()

    centre_rows = connection.execute("""
        SELECT
            c.id AS centre_id,
            c.name AS centre_name,
            c.location,
            c.daily_capacity,
            COUNT(b.id) AS total_bookings,
            COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_bookings
        FROM centres c
        LEFT JOIN bookings b ON c.id = b.centre_id
        GROUP BY c.id, c.name, c.location, c.daily_capacity
        ORDER BY total_bookings DESC
    """).fetchall()

    booking_status = connection.execute("""
        SELECT status, COUNT(*) AS count
        FROM bookings
        GROUP BY status
        ORDER BY count DESC
    """).fetchall()

    daily_trend = connection.execute("""
        SELECT s.date, COUNT(b.id) AS bookings
        FROM bookings b
        JOIN schedules s ON b.schedule_id = s.id
        GROUP BY s.date
        ORDER BY s.date ASC
        LIMIT 30
    """).fetchall()

    connection.close()

    centre_data = []
    for centre in centre_rows:
        capacity = centre["daily_capacity"] or 0
        bookings = centre["total_bookings"] or 0
        utilisation = round(min(100, (bookings / capacity) * 100), 1) if capacity else 0
        centre_data.append({
            "centre_id": centre["centre_id"],
            "centre_name": centre["centre_name"],
            "location": centre["location"],
            "daily_capacity": capacity,
            "total_bookings": bookings,
            "completed_bookings": centre["completed_bookings"],
            "utilisation": utilisation,
        })

    return {
        "overview": {
            "total_farmers": total_farmers,
            "total_crops": total_crops,
            "total_centres": total_centres,
            "total_schedules": total_schedules,
            "total_bookings": total_bookings,
            "active_bookings": active_bookings,
            "completed_bookings": completed_bookings,
            "average_waiting_time": round(float(waiting_summary["average_waiting_time"] or 0), 1),
            "paid_amount": round(float(payment_summary["paid_amount"] or 0), 2),
            "pending_amount": round(float(payment_summary["pending_amount"] or 0), 2),
        },
        "crop_demand": [dict(item) for item in crop_demand],
        "centre_utilisation": centre_data,
        "booking_status": [dict(item) for item in booking_status],
        "daily_trend": [dict(item) for item in daily_trend],
    }
