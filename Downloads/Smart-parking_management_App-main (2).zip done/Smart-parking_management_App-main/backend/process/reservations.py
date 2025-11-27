# reservation.py will work together with parkingSpots.py module to manage bookings and avilability of parking lots

from database import get_connection
from process.parkingSpots import update_parking_spot_availability
from process.notifications import create_notification
from datetime import datetime

# ===CREATE A RESERVATION===

def reserve_spot(data):
  """This module is for reservation by drivers"""

  driver_id = data.get("driver_id")
  spot_id = data.get("spot_id")
  start_time = data.get("start_time")
  end_time = data.get("end_time")
  total_price = data.get("total_price")

  # VALIDATION
  if not all([driver_id, spot_id, start_time, end_time, total_price]):
    return{"success": False, "message": "All fields are required!"}
  

  conn = get_connection()
  if not conn:
    return{"success": False, "message": "Database connection failed!"}
  cursor = conn.cursor(dictionary=True)

  # check if the spot exists and is available
  cursor.execute("SELECT * FROM parking_spot WHERE spot_id=%s", (spot_id,))
  spot = cursor.fetchone()
  if not spot:
    cursor.close()
    conn.close()
    return {"success": False, "message": "Parking spot not found!"}
  
  if spot["spot_number"] <= 0:
    cursor.close()
    conn.close()
    return {"success": False, "message": "No available spaces in this parking lot!"}
  
  # Create reservation
  cursor.execute(
    """
    INSERT INTO reservation (driver_id, spot_id, start_time, end_time, total_price, status)
    VALUES (%s, %s, %s, %s, %s, 'pending')
    """, (driver_id, spot_id, start_time, end_time, total_price))
  conn.commit()
  
  res_id = cursor.lastrowid
  
  create_notification({
      "driver_id": driver_id,
      "reservation_id": res_id,
      "type": "booking_approved",
      "title": "Reservation Created",
      "message": f"Your parking reservation has been created. Please complete payment to confirm."
  })
  
  cursor.close()
  conn.close()

  return{
    "success": True,
    "message": "Reservation created successfully. Waiting Payment.",
    "reservation_id": res_id,
    "status": "pending"  
  }

# === CONFIRM RESERVATION AFTER PAYMENT ===
def confirm_reservation(res_id):
  """Will activate reservation after paymnet is successful"""
  conn = get_connection()
  if not conn:
    return {"success": False, "message": "Database connection failed!"}
  cursor = conn.cursor(dictionary=True)

  # Find reservation
  cursor.execute("SELECT * FROM reservation WHERE res_id=%s", (res_id,))
  res = cursor.fetchone()
  if not res:
    cursor.close()
    conn.close()
    return {"success": False, "message": "Reservation not found!"}
  
  # Checking status
  if res["status"] != "pending":
    cursor.close()
    conn.close()
    return {"success": False, "message": f"Can't confirm reservation in '{res['status']}' state."}
  
  # Check for availability
  cursor.execute("SELECT spot_number FROM parking_spot WHERE spot_id=%s", (res["spot_id"],))
  spot = cursor.fetchone()
  if not spot or spot["spot_number"] <= 0:
    cursor.close(); conn.close()
    return {"success": False, "message": "No available parking spaces!"}
  

  # Confirm reservation
  new_available_spots = spot["spot_number"] - 1
  cursor.execute("""
      UPDATE reservation SET status='confirmed' WHERE res_id=%s
  """, (res_id,))
  # Update parking spot availability
  is_available = 1 if new_available_spots > 0 else 0
  cursor.execute("""
    UPDATE parking_spot
    SET spot_number=%s, is_available=%s
    WHERE spot_id=%s
  """, (new_available_spots, is_available, res["spot_id"]))
  conn.commit()
  
  cursor.close()
  conn.close()

  return{
    "success": True, 
    "message": "Reservation and parking spot reserved successfully."
  }


# === CANCELLING A RESERVATION ===

def cancel_reservation(data):
  """This module is for cancelling a reservation made"""
  res_id = data.get("res_id")

  if not res_id:
    return{"success": False, "message": "Reservation ID is required."}
  
  conn = get_connection()
  if not conn:
    return {"success": False, "message": "database connection failed!"}
  cursor = conn.cursor(dictionary=True)

  try:
    cursor.execute("""
        SELECT * FROM reservation
        WHERE res_id=%s
    """, (res_id,))

    res = cursor.fetchone()
    if not res:
      cursor.close()
      conn.close()
      return {"success": False, "message": "Reservation not found."}
    
    # cancellation of only confirmed or pending reservation
    if res["status"] in ["completed", "cancelled"]:
      cursor.close()
      conn.close()
      return {"success": False, "message": f"Reservation is already {res['status']}."}
    

    if res["status"] == "confirmed":
      cursor.execute("SELECT spot_number FROM parking_spot WHERE spot_id=%s", (res["spot_id"],))
      spot = cursor.fetchone()
      if spot:
        new_available_spots = spot["spot_number"] + 1
        cursor.execute("""
            UPDATE parking_spot
            SET spot_number=%s, is_available=1
            WHERE spot_id=%s
        """, (new_available_spots, res["spot_id"]))
        conn.commit()
    
    driver_id = res.get("driver_id")
    
    cursor.execute("UPDATE reservation SET status='cancelled' WHERE res_id=%s", (res_id,))
    conn.commit()
    
    cursor.close()
    conn.close()
    
    if driver_id:
        create_notification({
            "driver_id": driver_id,
            "reservation_id": res_id,
            "type": "booking_cancelled",
            "title": "Reservation Cancelled",
            "message": "Your parking reservation has been cancelled successfully."
        })

    return{"success": True, "message": "Reservation cancelled successfully!"}
  
  except Exception as e:
    conn.rollback()
    return {"success": False, "message": f"Error: {str(e)}"}
  
  finally:
    cursor.close()
    conn.close()

# === VIEWING DRIVER'S RESERVATIONS ===

def get_driver_reservations(driver_id):
  """Return all reservation made by a driver"""

  if not driver_id:
    return{"success": False, "message": "Driver ID Is required."}
  
  conn = get_connection()
  if not conn:
    return{"Success": False, "message": "Database connection failed!"}
  cursor = conn.cursor(dictionary=True)

  cursor.execute("""
    SELECT r.res_id, p.location, r.start_time, r.end_time, r.total_price, r.status
    FROM reservation r
    JOIN parking_spot p ON r.spot_id = p.spot_id
    WHERE r.driver_id = %s
    ORDER BY r.start_time DESC
  """, (driver_id,))

  reservations = cursor.fetchall()
  cursor.close()
  conn.close()

  if not reservations:
    return {"success": True, "reservations": [], "message": "No reservations found"}
  
  return {"success": True, "reservations": reservations}

# === CHECKOUT ===
def reservation_checkout(data):
  """This will be handling the checkout of the driver and freeing up the parking spot."""
  res_id = data.get("res_id")

  if not res_id:
    return {"success": False, "message": "Reservation ID is required for checkout!"}
  
  conn = get_connection()
  if not conn:
    return {"Success": False, "message": "Database connection faled!"}
  cursor = conn.cursor(dictionary=True)

  try:
    # Find reservation
    cursor.execute("""
        SELECT r.res_id, r.spot_id, r.start_time, r.end_time, r.status,
               p.price_per_hour, p.spot_number
        FROM reservation r
        JOIN parking_spot p ON r.spot_id = p.spot_id
        WHERE r.res_id=%s
    """, (res_id,))
    res = cursor.fetchone()

    if not res:
      return {"success": False, "message": "Reservation not found."}

    # Only confirmed/active reservations can be checked out
    if res["status"] not in ["confirmed", "active"]:
        return {"success": False, "message": f"Cannot checkout reservation in '{res['status']}' state."}

    # === Calculate parking duration ===
    actual_end_time = datetime.now()
    start_time = res["start_time"]

    # Calculate duration in hours (minimum 1)
    duration_hours = round((actual_end_time - start_time).total_seconds() / 3600, 2)
    duration_hours = max(1, duration_hours)

    # Calculate total price
    total_price = float(duration_hours) * float(res["price_per_hour"])

    # === Update reservation with final details ===
    cursor.execute("""
        UPDATE reservation
        SET status='completed',
            end_time=%s,
            total_price=%s
        WHERE res_id=%s
    """, (actual_end_time.strftime("%Y-%m-%d %H:%M:%S"), total_price, res_id))
    conn.commit()

    # === Free parking space ===
    new_available_spots = res["spot_number"] + 1
    cursor.execute("""
        UPDATE parking_spot
        SET spot_number=%s, is_available=1
        WHERE spot_id=%s
    """, (new_available_spots, res["spot_id"]))
    conn.commit()
    
    cursor.execute("SELECT driver_id FROM reservation WHERE res_id=%s", (res_id,))
    reservation = cursor.fetchone()
    driver_id = reservation.get("driver_id") if reservation else None

    cursor.close()
    conn.close()
    
    if driver_id:
        create_notification({
            "driver_id": driver_id,
            "reservation_id": res_id,
            "type": "checkout",
            "title": "Checkout Complete",
            "message": f"Your parking session has ended. Final amount: {total_price:.2f} RWF."
        })

    return {
        "success": True,
        "message": "Checkout completed successfully!",
        "checkout_summary": {
            "reservation_id": res_id,
            "start_time": str(start_time),
            "end_time": str(actual_end_time),
            "duration_hours": duration_hours,
            "price_per_hour": res["price_per_hour"],
            "total_price": total_price
        }
    }

  except Exception as e:
      conn.rollback()
      return {"success": False, "message": f"Error during checkout: {str(e)}"}

  finally:
      cursor.close()
      conn.close()
