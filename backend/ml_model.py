import os
import sqlite3
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor


DATABASE = "database/app.db"
MODEL_FILE = "waiting_time_model.pkl"

FEATURES = [
    "people_ahead",
    "centre_id",
    "capacity",
    "booked_slots",
]


def get_training_data():
    if not os.path.exists(DATABASE):
        return pd.DataFrame()

    connection = sqlite3.connect(DATABASE)

    query = """
        SELECT
            q.people_ahead,
            b.centre_id,
            s.capacity,
            s.booked_slots,
            q.actual_waiting_minutes
        FROM queue_events q

        JOIN bookings b
            ON q.booking_id = b.id

        JOIN schedules s
            ON b.schedule_id = s.id

        WHERE
            q.actual_waiting_minutes IS NOT NULL
            AND q.people_ahead IS NOT NULL
            AND b.centre_id IS NOT NULL
            AND s.capacity IS NOT NULL
            AND s.booked_slots IS NOT NULL
    """

    df = pd.read_sql_query(query, connection)

    connection.close()

    return df


def train_model():
    print("\n======================================")
    print(" FARMER PROCUREMENT AI ENGINE")
    print("======================================")

    df = get_training_data()

    if df.empty:
        print("No queue history found.")
        print("The model cannot be trained yet.")
        return False

    print(f"Training records found: {len(df)}")

    if len(df) < 5:
        print("\nNot enough real data.")
        print("Minimum required training records: 5")
        print(f"Current records: {len(df)}")
        return False

    X = df[FEATURES]
    y = df["actual_waiting_minutes"]

    model = RandomForestRegressor(
        n_estimators=150,
        random_state=42,
        max_depth=10,
        min_samples_leaf=2
    )

    model.fit(X, y)

    joblib.dump(model, MODEL_FILE)

    print("\nAI MODEL TRAINED SUCCESSFULLY")
    print("--------------------------------------")
    print(f"Records used : {len(df)}")
    print(f"Features     : {', '.join(FEATURES)}")
    print(f"Model file   : {MODEL_FILE}")
    print("--------------------------------------")

    return True


def model_exists():
    return os.path.exists(MODEL_FILE)


def predict_waiting_time(
    people_ahead,
    centre_id,
    capacity,
    booked_slots
):
    if not model_exists():
        return None

    model = joblib.load(MODEL_FILE)

    input_data = pd.DataFrame(
        [
            {
                "people_ahead": people_ahead,
                "centre_id": centre_id,
                "capacity": capacity,
                "booked_slots": booked_slots,
            }
        ]
    )

    prediction = model.predict(input_data)[0]

    return round(max(0, float(prediction)), 1)


if __name__ == "__main__":
    train_model()