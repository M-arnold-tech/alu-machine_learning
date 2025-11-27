USE defaultdb;

CREATE TABLE IF NOT EXISTS notification (
  notification_id INT NOT NULL AUTO_INCREMENT,
  driver_id INT DEFAULT NULL,
  operator_id INT DEFAULT NULL,
  reservation_id INT DEFAULT NULL,
  type ENUM('booking_approved', 'booking_cancelled', 'payment_confirmed', 'payment_failed', 'reminder', 'warning', 'checkout') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_driver (driver_id),
  KEY idx_operator (operator_id),
  KEY idx_reservation (reservation_id),
  KEY idx_read (is_read),
  KEY idx_created (created_at),
  CONSTRAINT fk_notification_driver FOREIGN KEY (driver_id) REFERENCES driver (driver_id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_operator FOREIGN KEY (operator_id) REFERENCES parking_operator (operator_id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_reservation FOREIGN KEY (reservation_id) REFERENCES reservation (res_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

