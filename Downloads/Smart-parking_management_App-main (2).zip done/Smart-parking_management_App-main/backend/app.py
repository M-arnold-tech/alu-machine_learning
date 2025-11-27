from flask import Flask
from flask_cors import CORS
import os

from api.authentication_api import auth_bp
from api.parking_api import parking_bp
from api.reservation_api import reservation_bp
from api.payment_api import payment_bp
from api.notification_api import notification_bp

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(parking_bp, url_prefix="/parking")
app.register_blueprint(reservation_bp, url_prefix="/reservation")
app.register_blueprint(payment_bp, url_prefix="/payment")
app.register_blueprint(notification_bp, url_prefix="/notification")

@app.route("/", methods=["GET"])
def home():
    return {"message": "Welcome to SmartSpaces API"}

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint for Render"""
    return {"status": "healthy", "service": "SmartSpaces API"}

if __name__ == "__main__":
    # Get port from environment variable (Render sets this) or default to 5000
    port = int(os.getenv("PORT", 5000))
    # Run in production mode on Render, debug mode locally
    debug = os.getenv("FLASK_DEBUG", "False") == "True"
    app.run(host="0.0.0.0", port=port, debug=debug)




