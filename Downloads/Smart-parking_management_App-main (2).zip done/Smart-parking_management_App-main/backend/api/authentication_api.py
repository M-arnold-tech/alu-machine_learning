from flask import Blueprint, request, jsonify
from process.authentication import signup_driver, login_driver, signup_operator, login_operator
from process.user_profile import get_driver_profile, update_driver_profile

auth_bp = Blueprint("auth_bp", __name__)

# Driver routes

@auth_bp.route("/driver/signup", methods=["POST"])
def driver_signup():
  data = request.get_json()
  result = signup_driver(data)
  return jsonify(result)

@auth_bp.route("/driver/login", methods=["POST"])
def driver_login():
  data = request.get_json()
  result = login_driver(data)
  return jsonify(result)

# Operator routes

@auth_bp.route("/operator/signup", methods=["POST"])
def operator_signup():
  data = request.get_json()
  result = signup_operator(data)
  return jsonify(result)

@auth_bp.route("/operator/login", methods=["POST"])
def operator_login():
  data = request.get_json()
  result = login_operator(data)
  return jsonify(result)

@auth_bp.route("/driver/profile/<int:driver_id>", methods=["GET"])
def get_driver_profile_route(driver_id):
  result = get_driver_profile(driver_id)
  return jsonify(result), 200 if result.get("success") else 404

@auth_bp.route("/driver/profile/<int:driver_id>", methods=["PUT"])
def update_driver_profile_route(driver_id):
  data = request.get_json()
  result = update_driver_profile(driver_id, data)
  return jsonify(result), 200 if result.get("success") else 400
