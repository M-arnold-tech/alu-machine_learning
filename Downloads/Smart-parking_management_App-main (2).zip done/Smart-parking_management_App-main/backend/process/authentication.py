# authentication.py will handle signup and login processes for both drivers and parking operators.

from database import get_connection
from werkzeug.security import generate_password_hash, check_password_hash

# === DRIVER SIGNUP ===

def signup_driver(data):
    """Registration of a new driver."""
    username = data.get("username")
    email =data.get("email")
    vehicle_plate = data.get("vehicle_plate")
    phone = data.get("phone_number")
    password = data.get("password")

    # TODO: check if the driver already exists in the db
    # TODO: add new driver in the db if they don't exist
    if not all([username, email, phone, vehicle_plate, password]):
        return {"success": False, "message": "All fields are required"}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Database connection failed."}
    cursor = conn.cursor(dictionary=True)
    
    # Check for duplicates (username, email, vehicle_plate, or phone_number)
    cursor.execute(
        "SELECT * FROM driver WHERE username=%s OR email=%s OR vehicle_plate=%s OR phone_number=%s",
        (username, email, vehicle_plate, phone)
    )
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return {"success": False, "message": "A driver with similar credentials already exists!"}
    
    # Hash the password
    hashed_password = generate_password_hash(password)

    # Add new driver
    cursor.execute("""
        INSERT INTO driver (username, email, password_hash, phone_number, vehicle_plate)
        VALUES (%s, %s, %s, %s, %s)
    """, (username, email, hashed_password, phone, vehicle_plate))
    conn.commit()
    
    driver_id = cursor.lastrowid
    cursor.execute("SELECT driver_id, username, email, phone_number, vehicle_plate, created_at FROM driver WHERE driver_id = %s", (driver_id,))
    new_driver = cursor.fetchone()

    cursor.close()
    conn.close()
    return {"success": True, "message": "Driver registered successfully!", "driver": new_driver}


# === DRIVER LOGIN ===

def login_driver(data):
    """
    It will work in login of drivers using the username and password.
    """
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"success": False, "message": "Email and password are required!"}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Database connection failed."}
    cursor = conn.cursor(dictionary=True)

    # Find driver
    cursor.execute("SELECT * FROM driver WHERE email=%s", (email,))
    driver = cursor.fetchone()

    cursor.close()
    conn.close()

    if not driver:
        return{"success": False, "message": "Driver not found."}
    
    if not check_password_hash(driver["password_hash"], password):
        return{"success": False, "message": "Incorrect password!"}
    
    # Removal of sensitive info
    driver.pop("password_hash", None)
    return {"success":True, "message": "Login Successful!", "driver": driver}

# === OPERATOR SIGNUP ===
def signup_operator(data):
    """This module will handle the signup of parking operators"""

    operator_name = data.get("operator_name")
    email = data.get("email")
    phone = data.get("phone_number")
    password = data.get("password")

    if not all([operator_name, email, phone, password]):
        return {"success": False, "message": "All fields are required!"}
    
    conn = get_connection()
    if not conn:
        return{"success": False, "message": "Database connection failed."}
    cursor = conn.cursor(dictionary=True)

    # Check if operator exists
    cursor.execute("SELECT * FROM parking_operator WHERE email=%s OR phone_number=%s", (email, phone))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return{"success": False, "message": "Operator already exists."}
    
    hashed_password = generate_password_hash(password)

    cursor.execute("""
        INSERT INTO parking_operator (operator_name, email, password_hash, phone_number)
        VALUES (%s, %s, %s, %s)
    """, (operator_name, email, hashed_password, phone))
    conn.commit()
    
    operator_id = cursor.lastrowid
    cursor.execute("SELECT operator_id, operator_name, email, phone_number, created_at FROM parking_operator WHERE operator_id = %s", (operator_id,))
    new_operator = cursor.fetchone()

    cursor.close()
    conn.close()
    return{"success": True, "message": "Operator registered successfully!", "operator": new_operator}

# === OPERATOR LOGIN ===

def login_operator(data):
    """ This module is for login of the parking operator using email and password"""

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return{"success": False, "message": "Email and password are required!"}
    
    conn = get_connection()
    if not conn:
        return{"success": False, "message": "Database connection failed."}
    cursor = conn.cursor(dictionary=True)

    # Find operator
    cursor.execute("SELECT * FROM parking_operator WHERE email=%s", (email,))
    operator = cursor.fetchone()

    cursor.close()
    conn.close()

    if not operator:
        return{"success": False, "message": "Operator not found."}
    
    if not check_password_hash(operator["password_hash"], password):
        return{"success": False, "message": "Incorrect password!"}
    
    operator.pop("password_hash", None)
    return{"success":True, "message": "Login Successful!", "operator": operator}
