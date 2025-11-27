import mysql.connector
from mysql.connector import Error
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT


def get_connection():
    """Return a mysql.connector connection using environment-configured credentials.

    Returns None on failure.
    """
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT,
        )

        if connection.is_connected():
            return connection

    except Error as e:
        print(f"[ERROR] Database connection failed: {e}")

    return None
  