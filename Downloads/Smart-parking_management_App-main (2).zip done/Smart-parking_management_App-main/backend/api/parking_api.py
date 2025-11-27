# Will handle the routes for parking spots and Lots management

from flask import Blueprint, request, jsonify
from process.parkingSpots import add_parking_spot, get_available_parking_spots, get_operator_parking_spots, get_operator_parking_spots

parking_bp = Blueprint("parking_bp", __name__)

@parking_bp.route("/add", methods=["POST"])
def add_parking_spot_route():
  data = request.get_json()
  result = add_parking_spot(data)
  return jsonify(result)

@parking_bp.route("/available", methods=["GET"])
def available_parking_spots_route():
  result = get_available_parking_spots()
  return jsonify(result)

@parking_bp.route("/operator/<int:operator_id>/stats", methods=["GET"])
def get_operator_stats(operator_id):
  from process.parkingSpots import get_operator_statistics
  result = get_operator_statistics(operator_id)
  return jsonify(result), 200 if result.get("success") else 400

@parking_bp.route("/operator/<int:operator_id>", methods=["GET"])
def get_operator_parking_spots_route(operator_id):
  result = get_operator_parking_spots(operator_id)
  return jsonify(result), 200 if result.get("success") else 400
