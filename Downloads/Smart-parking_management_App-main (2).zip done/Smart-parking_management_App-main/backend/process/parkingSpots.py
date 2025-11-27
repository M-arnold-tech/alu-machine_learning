# parkingSpots.py will handle all parking spots management and availability

from database import get_connection

# === ADD A PARKING LOT ===

def add_parking_spot(data):
  """
  Parking operator will add a new parking location with the capacity
  """
  operator_id = data.get("operator_id")
  location = data.get("location")
  price_per_hour = data.get("price_per_hour")
  total_spots = data.get("total_spots")

  # Validation
  if not all([operator_id, location, price_per_hour, total_spots]):
    return {"success": False, "message": "All fields are required!"}
  
  conn = get_connection()
  if not conn:
    return {"success": False, "message": "Database connection failed!"}
  
  cursor = conn.cursor(dictionary=True)

  # Checking for duplicates
  cursor.execute(
    "SELECT * FROM parking_spot WHERE operator_id=%s AND location=%s",
    (operator_id, location)
  )
  if cursor.fetchone():
    cursor.close()
    conn.close()
    return{"success": False, "message": "Parking lot already exists!"}
  
  # Add parking lot
  # Map to schema: parking_spot has columns (spot_id, spot_number, operator_id, location, price_per_hour, is_available,...)
  try:
    spot_number = int(total_spots)
  except Exception:
    cursor.close()
    conn.close()
    return {"success": False, "message": "Invalid total_spots; must be an integer."}

  is_available = 1 if spot_number > 0 else 0

  cursor.execute(
    """
    INSERT INTO parking_spot (operator_id, spot_number, location, price_per_hour, is_available)
    VALUES (%s, %s, %s, %s, %s)
    """,
    (operator_id, spot_number, location, price_per_hour, is_available)
  )
  conn.commit()
  cursor.close()
  conn.close()

  return {"success": True, "message": f"Parking lot '{location}' added successfully!"}

# === GET ALL AVAILABLE PARKING SPOTS ===

def get_available_parking_spots():
  """Fetches all parking lots with availble parking spots."""
  conn = get_connection()
  if not conn:
    return {"success": False, "message": "Database connection failed!"}
  cursor = conn.cursor(dictionary=True)

  cursor.execute("""
      SELECT spot_id, location, price_per_hour, spot_number, is_available
      FROM parking_spot
      WHERE is_available = 1
      ORDER BY location ASC
  """)
  spots = cursor.fetchall()

  cursor.close()
  conn.close()

  if not spots:
    return {"success": True, "parking_spots": [], "message": "No available spots found!"}
  
  return {"success": True, "parking_spots": spots}


# UPDATE PARKING SPOT AVAILABILITY

def update_parking_spot_availability(spot_id, available_spots):
  """Updates the number of available spots in a parking lot"""

  conn = get_connection()
  if not conn:
    return{"success": False, "message": "DATABASE connection failed!"}
  
  cursor = conn.cursor(dictionary=True)

  # Get total spots
  cursor.execute("SELECT total_spots FROM parking_spot WHERE spot_id=%s", (spot_id,))
  spot = cursor.fetchone()

  if not spot:
    cursor.close()
    conn.close()
    return {"success": False, "message": "Parking spot not found!"}
  
  total_spots = spot["total_spots"]
  is_available = 1 if available_spots > 0 else 0

  # Update spot
  cursor.execute("""
    UPDATE parking_spot
    SET available_spots = %s, is_available = %s
    WHERE spot_id = %s
  """, (available_spots, is_available, spot_id))

  conn.commit()
  cursor.close()
  conn.close()
  return {"success": True, "message": "Parking availability update successfully!"}

def get_operator_parking_spots(operator_id):
  if not operator_id:
    return {"success": False, "message": "Operator ID is required!"}
  
  conn = get_connection()
  if not conn:
    return {"success": False, "message": "Database connection failed!"}
  cursor = conn.cursor(dictionary=True)
  
  try:
    cursor.execute("""
      SELECT spot_id, location, price_per_hour, spot_number, is_available, created_at
      FROM parking_spot
      WHERE operator_id = %s
      ORDER BY created_at DESC
    """, (operator_id,))
    spots = cursor.fetchall()
    
    return {"success": True, "parking_spots": spots}
  except Exception as e:
    return {"success": False, "message": f"Error: {str(e)}"}
  finally:
    cursor.close()
    conn.close()

def get_operator_statistics(operator_id):
  if not operator_id:
    return {"success": False, "message": "Operator ID is required!"}
  
  conn = get_connection()
  if not conn:
    return {"success": False, "message": "Database connection failed!"}
  cursor = conn.cursor(dictionary=True)
  
  try:
    cursor.execute("""
      SELECT COUNT(*) as total_spaces, SUM(spot_number) as total_spots
      FROM parking_spot
      WHERE operator_id = %s
    """, (operator_id,))
    spaces = cursor.fetchone()
    
    from datetime import datetime, date
    today = date.today()
    
    cursor.execute("""
      SELECT COUNT(*) as today_bookings, COALESCE(SUM(r.total_price), 0) as today_revenue
      FROM reservation r
      JOIN parking_spot p ON r.spot_id = p.spot_id
      WHERE p.operator_id = %s
      AND DATE(r.created_at) = %s
    """, (operator_id, today))
    bookings = cursor.fetchone()
    
    return {
      "success": True,
      "stats": {
        "total_spaces": spaces["total_spaces"] or 0,
        "total_spots": spaces["total_spots"] or 0,
        "today_bookings": bookings["today_bookings"] or 0,
        "today_revenue": float(bookings["today_revenue"] or 0)
      }
    }
  except Exception as e:
    return {"success": False, "message": f"Error: {str(e)}"}
  finally:
    cursor.close()
    conn.close()
