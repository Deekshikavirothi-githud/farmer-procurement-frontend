
from database.db import get_db_connection


centres = [
    (
        "GreenField Procurement Centre",
        "Main Market Road",
        "Visakhapatnam",
        "Andhra Pradesh",
        "08:00 AM - 06:00 PM",
        150
    ),
    (
        "AgriConnect Procurement Hub",
        "Farmers Junction",
        "Anakapalle",
        "Andhra Pradesh",
        "08:00 AM - 05:00 PM",
        120
    ),
    (
        "Krishi Support Centre",
        "Rythu Bazaar Road",
        "Vizianagaram",
        "Andhra Pradesh",
        "09:00 AM - 06:00 PM",
        100
    ),
    (
        "HarvestLink Procurement Point",
        "Agricultural Market Yard",
        "Srikakulam",
        "Andhra Pradesh",
        "08:30 AM - 05:30 PM",
        130
    )
]


connection = get_db_connection()

for centre in centres:
    connection.execute(
        """
        INSERT INTO centres (
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
connection.close()

print("Procurement centres added successfully.")

