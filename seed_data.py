from database.db import get_db_connection, init_db

init_db()

connection = get_db_connection()

# ---------------------------------------------------------
# CLEAR OLD TEST DATA
# ---------------------------------------------------------

connection.execute("DELETE FROM schedules")
connection.execute("DELETE FROM centres")

# ---------------------------------------------------------
# PROCUREMENT CENTRES
# ---------------------------------------------------------

centres = [
    (
        "Green Valley Procurement Centre",
        "Vepagunta",
        "Visakhapatnam",
        "Andhra Pradesh",
        "08:00 AM - 05:00 PM",
        250
    ),
    (
        "Andhra Agri Collection Hub",
        "Pendurthi",
        "Visakhapatnam",
        "Andhra Pradesh",
        "08:00 AM - 05:00 PM",
        300
    ),
    (
        "Farmers First Procurement Centre",
        "Anakapalle",
        "Anakapalli",
        "Andhra Pradesh",
        "07:30 AM - 04:30 PM",
        220
    ),
]

for centre in centres:
    connection.execute(
        """
        INSERT INTO centres
        (
            name,
            location,
            district,
            state,
            operating_hours,
            daily_capacity
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        centre
    )

connection.commit()

# ---------------------------------------------------------
# GET CENTRE IDS
# ---------------------------------------------------------

centre_rows = connection.execute(
    "SELECT id, name FROM centres ORDER BY id"
).fetchall()

centre_ids = {
    row["name"]: row["id"]
    for row in centre_rows
}

# ---------------------------------------------------------
# PROCUREMENT SCHEDULES
# ---------------------------------------------------------

schedules = [
    (
        centre_ids["Green Valley Procurement Centre"],
        "Paddy",
        "2026-09-15",
        "08:00",
        "10:00",
        50,
        12,
        "OPEN"
    ),
    (
        centre_ids["Green Valley Procurement Centre"],
        "Paddy",
        "2026-09-15",
        "10:00",
        "12:00",
        50,
        18,
        "OPEN"
    ),
    (
        centre_ids["Green Valley Procurement Centre"],
        "Paddy",
        "2026-09-15",
        "01:00",
        "03:00",
        50,
        8,
        "OPEN"
    ),
    (
        centre_ids["Andhra Agri Collection Hub"],
        "Paddy",
        "2026-09-15",
        "08:00",
        "10:00",
        60,
        20,
        "OPEN"
    ),
    (
        centre_ids["Andhra Agri Collection Hub"],
        "Paddy",
        "2026-09-15",
        "10:00",
        "12:00",
        60,
        25,
        "OPEN"
    ),
    (
        centre_ids["Farmers First Procurement Centre"],
        "Paddy",
        "2026-09-15",
        "08:30",
        "10:30",
        45,
        7,
        "OPEN"
    ),
    (
        centre_ids["Farmers First Procurement Centre"],
        "Paddy",
        "2026-09-15",
        "10:30",
        "12:30",
        45,
        10,
        "OPEN"
    ),
]

for schedule in schedules:
    connection.execute(
        """
        INSERT INTO schedules
        (
            centre_id,
            crop_name,
            date,
            start_time,
            end_time,
            capacity,
            booked_slots,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        schedule
    )

connection.commit()
connection.close()

print("")
print("======================================")
print(" FARMER PROCUREMENT TEST DATA")
print("======================================")
print("")
print("Procurement centres created : 3")
print("Paddy schedules created     : 7")
print("")
print("Test data inserted successfully!")
print("")