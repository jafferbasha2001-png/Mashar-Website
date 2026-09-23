CREATE DATABASE IF NOT EXISTS sample_store;
USE sample_store;

CREATE TABLE IF NOT EXISTS customers (
  customer_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  city VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  UNIQUE KEY customers_email_unique (email)
);

INSERT IGNORE INTO customers (first_name, last_name, email, phone, city, country) VALUES
  ('Ahmed', 'Al Harbi', 'ahmed.alharbi@example.test', '+966500000001', 'Hail', 'Saudi Arabia'),
  ('Noura', 'Al Qahtani', 'noura.alqahtani@example.test', '+966500000002', 'Riyadh', 'Saudi Arabia'),
  ('Omar', 'Hassan', 'omar.hassan@example.test', '+201000000003', 'Cairo', 'Egypt'),
  ('Layla', 'Mansour', 'layla.mansour@example.test', '+971500000004', 'Dubai', 'United Arab Emirates');