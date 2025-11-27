from database import get_connection
from datetime import datetime, timedelta

def create_notification(data):
    driver_id = data.get("driver_id")
    operator_id = data.get("operator_id")
    reservation_id = data.get("reservation_id")
    notification_type = data.get("type")
    title = data.get("title")
    message = data.get("message")
    
    if not all([notification_type, title, message]):
        return {"success": False, "message": "Type, title, and message are required!"}
    
    if not driver_id and not operator_id:
        return {"success": False, "message": "Either driver_id or operator_id is required!"}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Database connection failed!"}
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            INSERT INTO notification (driver_id, operator_id, reservation_id, type, title, message)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (driver_id, operator_id, reservation_id, notification_type, title, message))
        conn.commit()
        
        notification_id = cursor.lastrowid
        return {
            "success": True,
            "message": "Notification created successfully!",
            "notification_id": notification_id
        }
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Error: {str(e)}"}
    finally:
        cursor.close()
        conn.close()

def get_driver_notifications(driver_id, unread_only=False):
    if not driver_id:
        return {"success": False, "message": "Driver ID is required!"}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Database connection failed!"}
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        query = """
            SELECT n.*, r.res_id, p.location
            FROM notification n
            LEFT JOIN reservation r ON n.reservation_id = r.res_id
            LEFT JOIN parking_spot p ON r.spot_id = p.spot_id
            WHERE n.driver_id = %s
        """
        
        if unread_only:
            query += " AND n.is_read = 0"
        
        query += " ORDER BY n.created_at DESC LIMIT 50"
        
        cursor.execute(query, (driver_id,))
        notifications = cursor.fetchall()
        
        for notif in notifications:
            notif['created_at'] = notif['created_at'].isoformat() if notif['created_at'] else None
        
        return {"success": True, "notifications": notifications}
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}
    finally:
        cursor.close()
        conn.close()

def mark_notification_read(notification_id, driver_id=None):
    if not notification_id:
        return {"success": False, "message": "Notification ID is required!"}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Database connection failed!"}
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        query = "UPDATE notification SET is_read = 1 WHERE notification_id = %s"
        params = [notification_id]
        
        if driver_id:
            query += " AND driver_id = %s"
            params.append(driver_id)
        
        cursor.execute(query, params)
        conn.commit()
        
        return {"success": True, "message": "Notification marked as read"}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Error: {str(e)}"}
    finally:
        cursor.close()
        conn.close()

def mark_all_read(driver_id):
    if not driver_id:
        return {"success": False, "message": "Driver ID is required!"}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Database connection failed!"}
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("UPDATE notification SET is_read = 1 WHERE driver_id = %s", (driver_id,))
        conn.commit()
        
        return {"success": True, "message": "All notifications marked as read"}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": f"Error: {str(e)}"}
    finally:
        cursor.close()
        conn.close()

def get_unread_count(driver_id):
    if not driver_id:
        return {"success": False, "count": 0}
    
    conn = get_connection()
    if not conn:
        return {"success": False, "count": 0}
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT COUNT(*) as count FROM notification WHERE driver_id = %s AND is_read = 0", (driver_id,))
        result = cursor.fetchone()
        return {"success": True, "count": result['count'] if result else 0}
    except Exception as e:
        return {"success": False, "count": 0}
    finally:
        cursor.close()
        conn.close()

