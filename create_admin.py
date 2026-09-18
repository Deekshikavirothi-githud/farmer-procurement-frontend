from database.db import get_db_connection
from auth import hash_password


PHONE = "9999999999"
PASSWORD = "Admin@12345"


connection = get_db_connection()

existing = connection.execute(
    """
    SELECT id
    FROM users
    WHERE phone = ?
    """,
    (PHONE,)
).fetchone()


if existing:

    print("Admin account already exists.")

else:

    password_hash = hash_password(PASSWORD)

    connection.execute(
        """
        INSERT INTO users
        (
            phone,
            password_hash,
            role,
            farmer_id
        )
        VALUES (?, ?, 'ADMIN', NULL)
        """,
        (
            PHONE,
            password_hash
        )
    )

    connection.commit()

    print("Admin account created successfully!")
    print("Phone:", PHONE)
    print("Password:", PASSWORD)


connection.close()