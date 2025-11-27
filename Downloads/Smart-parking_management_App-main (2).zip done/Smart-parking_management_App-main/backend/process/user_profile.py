from database import get_connection
from werkzeug.security import generate_password_hash, check_password_hash

def get_driver_profile(driver_id):
    if not driver_id:
        return {"success": False, "message": "Driver ID is required!"}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Database connection failed!"}
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT driver_id, username, email, phone_number, vehicle_plate, created_at
            FROM driver
            WHERE driver_id = %s
        """, (driver_id,))
        
        driver = cursor.fetchone()
        
        if not driver:
            return {"success": False, "message": "Driver not found!"}
        
        driver.pop("password_hash", None)
        return {"success": True, "driver": driver}
    
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}
    finally:
        cursor.close()
        conn.close()

def update_driver_profile(driver_id, data):
    if not driver_id:
        return {"success": False, "message": "Driver ID is required!"}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Database connection failed!"}
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM driver WHERE driver_id = %s", (driver_id,))
        driver = cursor.fetchone()
        
        if not driver:
            return {"success": False, "message": "Driver not found!"}
        
        updates = []
        values = []
        
        if "username" in data and data["username"]:
            updates.append("username = %s")
            values.append(data["username"])
        
        if "email" in data and data["email"]:
            cursor.execute("SELECT driver_id FROM driver WHERE email = %s AND driver_id != %s", (data["email"], driver_id))
            if cursor.fetchone():
                return {"success": False, "message": "Email already in use!"}
            updates.append("email = %s")
            values.append(data["email"])
        
        if "phone_number" in data and data["phone_number"]:
            updates.append("phone_number = %s")
            values.append(data["phone_number"])
        
        if "vehicle_plate" in data and data["vehicle_plate"]:
            updates.append("vehicle_plate = %s")
            values.append(data["vehicle_plate"])
        
        if "password" in data and data["password"]:
            updates.append("password_hash = %s")
            values.append(generate_password_hash(data["password"]))
        
        if not updates:
            return {"success": False, "message": "No fields to update!"}
        
        values.append(driver_id)
        query = f"UPDATE driver SET {', '.join(updates)} WHERE driver_id = %s"
        cursor.execute(query, values)
        conn.commit()
        
        cursor.execute("""
            SELECT driver_id, username, email, phone_number, vehicle_plate, created_at
            FROM driver
            WHERE driver_id = %s
        """, (driver_id,))
        
        updated_driver = cursor.fetchone()
        updated_driver.pop("password_hash", None)
        
        return {"success": True, "message": "Profile updated successfully!", "driver": updated_driver}
    
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Error: {str(e)}"}
    finally:
        cursor.close()
        conn.close()

