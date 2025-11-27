# Will handle the reservation, viewing and cancelling

from flask import Blueprint, request, jsonify
from process.reservations import reserve_spot, cancel_reservation, get_driver_reservations, reservation_checkout

reservation_bp = Blueprint("reservation_bp", __name__)

# === BOOK RESERVATION ===
@reservation_bp.route("/book", methods=["POST"])
def book_reservation():
  data = request.get_json()
  if not data:
    return jsonify({
      "success": False,
      "message": "Missing JSON Data.",
      "notification": {
        "type": "error",
        "title": "Booking Failed",
        "message": "No Reservation data was found. Please try again."
      }
    }), 400
  
  result = reserve_spot(data)

  # Live status update
  if result.get("success"):
    result["res_id"] = result.get("reservation_id")
    result["status_update"] = {
      "reservation_status": "pending",
      "payment_status": "pending"
    }
    result["notification"] = {
      "type": "success",
      "title": "Reservation Created",
      "message": "Your parking spot has been reserved! Please complete your payment to confirm your reservation."
    }
  else:
    result["notification"] = {
      "type": "error",
      "title": "Booking Failed",
      "message": result.get("message", "Unable to confirm reservation. Please try again.")
    }

  return jsonify(result), 200 if result.get("success") else 400

# ===CANCEL RESERVATION ===
@reservation_bp.route("/cancel", methods=["PUT"])
def cancel_reservation_route():
  data = request.get_json()
  if not data:
    return jsonify({
      "success": False,
      "message": "Missing JSON Data.",
      "notification": {
        "type": "error",
        "title": "cancellation failed",
        "message": "No data was provided. Please try again."
      }
    }), 400
  
  result = cancel_reservation(data)

  # Live status update
  if result.get("success"):
    result["status_update"] = {
      "reservation_status": "cancelled",
      "payment_status": "refunded"
    }

    result["notification"] = {
      "type": "info",
      "title": "Reservation Cancelled",
      "message": "Your reservation has been cancelled."
    }
  else:
    result["notification"] = {
      "type": "error",
      "title": "Cancellation Failed",
      "message": result.get("message", "Unable to cancel reservation. Please try again.")
    }

  return jsonify(result), 200 if result.get("success") else 400

# === GET DRIVER RESERVATIONS ===
@reservation_bp.route("/driver/<int:driver_id>", methods=["GET"])
def get_reservation_for_driver(driver_id):
  result = get_driver_reservations(driver_id)

  if result.get("success"):
    reservations = result.get("reservations", [])
    reservation_count = len(reservations)

    if reservation_count == 0:
      result["notification"] = {
        "type": "info",
        "title": "No Reservations Found",
        "message": "You don't have any reservation. Book a new reservation."
      }
    else:
      # Check active reservation
      active_count = sum(1 for r in reservations if r.get("status") in ["pending", "confirmed"])
      completed_count = sum(1 for r in reservations if r.get("status") == "completed")

      if active_count > 0:
        result["notification"] = {
          "type": "success",
          "title": "Reservations Retrieved",
          "message": f"You have {active_count} active reservation(s) and {completed_count} completed reservation(s)."
        }
      else:
        result["notification"] = {
          "type": "info",
          "title": "Reservations Retrieved",
          "message": f"You have {completed_count} completed reservation(s). No active reservations Now."
        }
  else:
    result["notification"] = {
      "type": "error",
      "title": "Retrieval Failed",
      "message": result.get("message", "Unable to get your reservation(s). Please try again later!")
    }

  return jsonify(result), 200 if result.get("success") else 404

# === CHECKOUT RESERVATION ===
@reservation_bp.route("/checkout", methods=["PUT"])
def checkout_reservation_route():
  data = request.get_json()
  if not data:
    return jsonify({
      "success": False,
      "message": "Missing JSON Data.",
      "notification": {
        "type": "error",
        "title": "Checkout Failed",
        "message": "No checkout info was found."
      }
    }), 400
  
  result = reservation_checkout(data)

  # Live status update
  if result.get("success"):
    result["status_update"] = {
      "reservation_status": "completed",
      "payment_status": "completed"
    }

    additional_charges = result.get("additional_charges", 0)
    if additional_charges > 0:
      result["notification"] = {
        "type": "warning",
        "title": "Checkout Complete - Aditional Charges",
        "message": f"Ypur parking session has ended. Additional charges of RWF{additional_charges:.2f} have been added."
      }
    else:
      result["notification"] = {
        "type": "success",
        "title": "Checkout completed",
        "message": "Thank you for using Smart-Spaces! Your parking has ended successfully."
      }
  else:
    result["notification"] = {
      "type": "error",
      "title": "Checkout Failed",
      "message": result.get("message", "Unable to complete checkout. Please try again.")
    }

  return jsonify(result), 200 if result.get("success") else 400
