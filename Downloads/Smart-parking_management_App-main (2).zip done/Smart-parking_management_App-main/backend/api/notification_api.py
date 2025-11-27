from flask import Blueprint, request, jsonify
from process.notifications import (
    create_notification, get_driver_notifications, 
    mark_notification_read, mark_all_read, get_unread_count
)

notification_bp = Blueprint("notification_bp", __name__)

@notification_bp.route("/driver/<int:driver_id>", methods=["GET"])
def get_notifications(driver_id):
    unread_only = request.args.get("unread_only", "false").lower() == "true"
    result = get_driver_notifications(driver_id, unread_only)
    return jsonify(result), 200 if result.get("success") else 400

@notification_bp.route("/unread-count/<int:driver_id>", methods=["GET"])
def get_unread_count_route(driver_id):
    result = get_unread_count(driver_id)
    return jsonify(result), 200

@notification_bp.route("/read/<int:notification_id>", methods=["PUT"])
def mark_read(notification_id):
    data = request.get_json() or {}
    driver_id = data.get("driver_id")
    result = mark_notification_read(notification_id, driver_id)
    return jsonify(result), 200 if result.get("success") else 400

@notification_bp.route("/read-all/<int:driver_id>", methods=["PUT"])
def mark_all_read_route(driver_id):
    result = mark_all_read(driver_id)
    return jsonify(result), 200 if result.get("success") else 400

@notification_bp.route("/create", methods=["POST"])
def create_notification_route():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Missing JSON data"}), 400
    
    result = create_notification(data)
    return jsonify(result), 200 if result.get("success") else 400

