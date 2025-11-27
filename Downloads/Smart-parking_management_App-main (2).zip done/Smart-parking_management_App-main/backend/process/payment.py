# This will handle the payments logic and update the status for the reservations.

from database import get_connection
from datetime import datetime
from process.parkingSpots import update_parking_spot_availability
from process.notifications import create_notification

# === PAYMENT INITIATION ===
def initiate_payment(data):
  """This will handle payment initiation and reservation will remain pending until payment is confirmed"""

  res_id = data.get("res_id")
  amount = data.get("amount")
  payment_method = data.get("payment_method", "cash").lower() # cash is the default

  if not all([res_id, amount]):
    return {"success": False, "message": "Resrvation ID and amount are all required!"}
  if payment_method not in ["cash", "card", "mobile_money"]:
    return{"success": False, "message": "Invalid payment method!"}
  
  conn = get_connection()
  if not conn:
    return {"success": False, "message": "Database connection Failed!"}
  cursor = conn.cursor(dictionary=True)

  try:
    # Will verify if reservation exists and needs to be paid
    cursor.execute("""
        SELECT res_id, status FROM reservation WHERE res_id=%s
    """, (res_id,))
    reservation = cursor.fetchone()

    if not reservation:
      return {"success": False, "message": "Reservation not found."}
    
    if reservation["status"].lower() in ["completed", "cancelled"]:
      return {"success": False, "message": f"Reservation already {reservation['status']}."}
    
    # Log the payment
    cursor.execute("""
        INSERT INTO payment (res_id, amount, payment_method, status, payment_date)
        VALUES (%s, %s, %s, 'pending', NOW())
    """, (res_id, amount, payment_method))
    conn.commit()

    payment_id = cursor.lastrowid

    return {
      "success": True,
      "message": f"payment pending, awaiting confirmation.",
      "payment_id": payment_id,
      "reservation_id": res_id,
      "status": "pending"
    }
  
  except Exception as e:
    conn.rollback()
    return {"success": False, "message": f"Error: {str(e)}"}
  finally:
    cursor.close()
    conn.close()

# === CONFIRMATION/FAILING OF PAYMENT ===
def confirm_payment(data):
  """This will confirm or fail the payment and update the reservation and parking spot"""

  payment_id = data.get("payment_id")
  is_confirmed = data.get("success", True)

  if not payment_id:
    return {"success": False, "message": "Payment ID is required!"}

  try:
    payment_id = int(payment_id)
  except (ValueError, TypeError):
    return {"success": False, "message": "Invalid payment ID format."}

  conn = get_connection()
  if not conn:
    return {"success": False, "message": "Database connection Failed!"}
  cursor = conn.cursor(dictionary=True)

  try:
    # Find payment data
    cursor.execute("""
        SELECT payment_id, res_id, amount, status
        FROM payment
        WHERE payment_id=%s
    """, (payment_id,))
    payment = cursor.fetchone()

    if not payment:
      return {"success": False, "message": "Payment not found."}
    if payment["status"].lower() != "pending":
      return {"success": False, "message": f"payment is already {payment['status']}."}
    
    if is_confirmed:
      cursor.execute("""
          UPDATE payment SET status='completed', payment_date=NOW()
          WHERE payment_id=%s
      """, (payment_id,))
      conn.commit()

      cursor.execute("""
          UPDATE reservation
          SET status='confirmed'
          WHERE res_id=%s
      """, (payment["res_id"],))
      conn.commit()
      
      cursor.execute("""
          UPDATE parking_spot ps
          JOIN reservation r ON ps.spot_id = r.spot_id
          SET ps.spot_number = ps.spot_number - 1,
              ps.is_available = CASE WHEN ps.spot_number > 1 THEN 1 ELSE 0 END
          WHERE r.res_id=%s
      """, (payment["res_id"],))
      conn.commit()
      
      cursor.execute("SELECT driver_id FROM reservation WHERE res_id = %s", (payment["res_id"],))
      reservation = cursor.fetchone()
      
      if reservation:
          try:
              # Safely get amount from payment record
              amount = payment.get("amount")
              if amount is None:
                  amount = 0
              else:
                  # Convert Decimal to float/string if needed
                  try:
                      amount = float(amount)
                  except (ValueError, TypeError):
                      amount = 0
              
              amount_str = f"{amount:.2f}" if amount > 0 else "0"
              create_notification({
                  "driver_id": reservation["driver_id"],
                  "reservation_id": payment["res_id"],
                  "type": "payment_confirmed",
                  "title": "Payment Confirmed",
                  "message": f"Your payment of {amount_str} RWF has been confirmed. Your reservation is now active."
              })
          except Exception as e:
              print(f"Error creating notification: {e}")
              # Create notification without amount if there's an error
              create_notification({
                  "driver_id": reservation["driver_id"],
                  "reservation_id": payment["res_id"],
                  "type": "payment_confirmed",
                  "title": "Payment Confirmed",
                  "message": "Your payment has been confirmed. Your reservation is now active."
              })

      result_message = "Payment confirmed and reservation activated."
    else:
        # Payment failed
        cursor.execute("""
            UPDATE payment SET status='failed', payment_date=NOW()
            WHERE payment_id=%s
        """, (payment_id,))
        conn.commit()
        result_message = "Payment marked as failed."

    return {"success": True, "message": result_message, "payment_id": payment_id}

  except Exception as e:
      conn.rollback()
      return {"success": False, "message": f"Error: {str(e)}"}
  finally:
      cursor.close()
      conn.close()

# === GET PAYMENT STATUS ===
def get_payment_status(res_id):

  if not res_id:
    return{"success": False, "message": "Reservation ID is required!"}
  
  conn = get_connection()
  if not conn:
    return {"success": False, "message": "Database connection failed!"}
  cursor = conn.cursor(dictionary=True)

  try:
    cursor.execute("""
        SELECT payment_id, res_id, amount, payment_method, status, payment_date
        FROM payment
        WHERE res_id=%s
    """, (res_id,))
    payment = cursor.fetchone()

    if not payment:
      return {"success": False, "message": "No payment found for this reservation."}
    
    return{"success": True, "payment": payment}
  
  except Exception as e:
    return {"success": False, "message": str(e)}
  
  finally:
    cursor.close()
    conn.close()
