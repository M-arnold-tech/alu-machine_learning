# Is the route for the payments

from flask import Blueprint, request, jsonify
from process.payment import initiate_payment, confirm_payment, get_payment_status

payment_bp = Blueprint("payment_bp", __name__)

# === INITIATE PAYMENT ===
@payment_bp.route("/initiate", methods=["POST"])
def payment_initiation():
  """
  Will helping in processing a payment for a reservation
  """

  data = request.get_json()
  if not data:
    return jsonify({
      "success": False,
      "message": "Missing JSON Data.",
      "notification": {
        "type": "error",
        "title": "Payment Failed",
        "message": "Payment failed. Please try again."
      }
    }), 400
  
  result = initiate_payment(data)

  # Live status update
  if result.get("success"):
    result["status_update"] = {
      "payment_status": "pending",
      "reservation_status": "pending"
    }
    
    result["notification"] = {
      "type": "info",
      "title": "payment initiated",
      "message": "Your payment was processed. Please wait for confirmation."
    }
  else:
    result["notification"] = {
      "type": "error",
      "title": "Payment Initialization failed",
      "message": result.get("message", "Failed to initiate payment. Please retry again.")
    }

  return jsonify(result), 200 if result.get("success") else 400


# === CONFIRM/FAIL PAYMENT ===
@payment_bp.route("/confirm", methods=["PUT"])
def payment_confirmation():
  """
  Will help to log confirmed payment
  """
  data = request.get_json()
  if not data:
    return jsonify({
      "success": False,
      "message": "Missing JSON Data.",
      "notification": {
        "type": "error",
        "title": "Confirmation failed",
        "message": "Payment was not confirmed."
      }
      }), 400
  
  result = confirm_payment(data)

  #live status update
  if result.get("success"):
    if "failed" in result.get("message", "").lower():
      result["status_update"] = {
        "payment_status": "failed",
        "reservation_status": "pending"
      }
      result["notification"] = {
        "type": "error",
        "title": "Payment Failed",
        "message": "Your payment failed. Please try again."
      }
    else:
      result["status_update"] = {
        "payment_status": "confirmed",
        "reservation_status": "confirmed"
      }
      result["notification"] = {
        "type": "success",
        "title": "Payment Confirmed",
        "message": "Your payment was successful. Your reservation is now confirmed!"
      }
  else:
    result["notification"] = {
      "type": "error",
      "title": "Confirmation Error",
      "message": result.get("message", "Unable to Confirm payment status.")
    }

  return jsonify(result), 200 if result.get("success") else 400


# === GET PAYMENT STATUS ===
@payment_bp.route("/status/<int:res_id>", methods=["GET"])
def payment_status(res_id):
  """Get payment info for a specific reservation."""
  result = get_payment_status(res_id)

  if result.get("success") and "payment" in result:
    payment = result["payment"]
    status = payment["status"]

    result["status_update"] = {
      "payment_status": status,
      "reservation_status": "confirmed" if status == "confirmed" else "pending"
    }

    notification_messages = {
      "confirmed": {
        "type": "success",
        "title": "Payment Confirmed",
        "message": "Your payment has been confirmed. Your reservation is now active."
      },

      "pending": {
        "type": "info",
        "title": "Payment Pending",
        "message": "Your payment is being processed. Please wait."
      },

      "failed": {
        "type": "error",
        "title": "Payment Failed",
        "message": "Your payment failed. Please try again."
      },

      "cancelled": {
        "type": "warning",
        "title": "Payment Cancelled",
        "message": "Your payment has been cancelled."
      }
    }
    result["notification"] = notification_messages.get(status, {
      "type": "info",
      "title": "Payment Status",
      "message": f"payment status: {status}"
    })
  else:
    result["notification"] = {
      "type": "error",
      "title": "Status Unavailable",
      "message": result.get("message", "Unable to retrieve payment status. Please try again.")
    }
    
  return jsonify(result), 200 if result.get("success") else 400
