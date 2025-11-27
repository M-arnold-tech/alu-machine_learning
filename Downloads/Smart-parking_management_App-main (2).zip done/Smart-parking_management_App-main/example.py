from database import get_connection
from werkzeug.security import generate_password_hash
from process.reservations import reserve_spot, reservation_checkout
from process.payment import make_payment
from datetime import datetime, timedelta

def example_data():
    conn = get_connection()
    if not conn:
        print("Database connection failed!")
        return

    cursor = conn.cursor(dictionary=True)

    # === Add parking operator ===
    operator_name = "Stan"
    operator_email = "r.stan@smartspaces.com"
    operator_phone = "0788643197"
    operator_password = generate_password_hash("Stan987")

    cursor.execute("SELECT operator_id FROM parking_operator WHERE email = %s", (operator_email,))
    operator_exists = cursor.fetchone()

    if not operator_exists:
        cursor.execute("""
            INSERT INTO parking_operator (operator_name, email, password_hash, phone_number)
            VALUES (%s, %s, %s, %s)
        """, (operator_name, operator_email, operator_password, operator_phone))
        conn.commit()
        print(f"✅ Added operator: {operator_name}")
    else:
        print(f"ℹ️ Operator '{operator_name}' already exists.")

    # === Add driver ===
    driver_username = "Dany"
    driver_email = "sanodany@gmail.com"
    driver_phone = "0788875421"
    driver_plate = "RAC675F"
    driver_password = generate_password_hash("Sada951")

    cursor.execute("SELECT driver_id FROM driver WHERE username = %s OR email = %s", (driver_username, driver_email))
    driver_exists = cursor.fetchone()

    if not driver_exists:
        cursor.execute("""
            INSERT INTO driver (username, email, password_hash, phone_number, vehicle_plate)
            VALUES (%s, %s, %s, %s, %s)
        """, (driver_username, driver_email, driver_password, driver_phone, driver_plate))
        conn.commit()
        print(f"✅ Added driver: {driver_username}")
    else:
        print(f"ℹ️ Driver '{driver_username}' already exists.")

    # === Add parking lot ===
    cursor.execute("SELECT operator_id FROM parking_operator WHERE email=%s", (operator_email,))
    operator = cursor.fetchone()
    if operator:
        operator_id = operator["operator_id"]
        location = "KAFAM"
        price_per_hour = 300
        spot_number = 50

        cursor.execute("SELECT spot_id FROM parking_spot WHERE operator_id = %s AND location = %s",
                       (operator_id, location))
        spot_exists = cursor.fetchone()

        if not spot_exists:
            cursor.execute("""
                INSERT INTO parking_spot (operator_id, location, price_per_hour, spot_number, is_available)
                VALUES (%s, %s, %s, %s, 1)
            """, (operator_id, location, price_per_hour, spot_number))
            conn.commit()
            print(f"✅ Added parking lot: {location}")
        else:
            print(f"ℹ️ Parking lot '{location}' already exists.")
    else:
        print("❌ Operator not found. Could not add parking lot.")

    # === Fetch Driver & Spot IDs ===
    cursor.execute("SELECT driver_id FROM driver WHERE email=%s", (driver_email,))
    driver = cursor.fetchone()
    driver_id = driver["driver_id"]

    cursor.execute("SELECT spot_id FROM parking_spot WHERE operator_id=%s AND location=%s",
                   (operator_id, location))
    spot = cursor.fetchone()
    spot_id = spot["spot_id"]

    cursor.close()
    conn.close()

    print("\n🚀 Starting Reservation, Payment, and Checkout Flow...\n")

    # === 1️⃣ Create Reservation (Pending) ===
    start_time = datetime.now()
    end_time = start_time + timedelta(hours=2)

    reservation_data = {
        "driver_id": driver_id,
        "spot_id": spot_id,
        "start_time": start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "end_time": end_time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_price": 600
    }

    reservation_result = reserve_spot(reservation_data)
    print("🟡 Reservation Result:", reservation_result)

    if not reservation_result.get("success"):
        print("❌ Reservation failed. Exiting flow.")
        return

    res_id = reservation_result["reservation_id"]

    # === 2️⃣ Make Payment (Confirm Reservation) ===
    payment_data = {
        "res_id": res_id,
        "amount": 600,
        "payment_method": "card"
    }

    payment_result = make_payment(payment_data)
    print("💰 Payment Result:", payment_result)

    # === 3️⃣ Checkout (Free Parking Spot) ===
    checkout_data = {"res_id": res_id}
    checkout_result = reservation_checkout(checkout_data)
    print("🚗 Checkout Result:", checkout_result)

    print("\n✅ Example Flow Completed Successfully!\n")

if __name__ == "__main__":
    example_data()
