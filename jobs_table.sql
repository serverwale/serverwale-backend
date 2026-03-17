-- Run this in your MySQL/phpMyAdmin to create the jobs table
-- Database: serverwale

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) DEFAULT 'Delhi NCR',
  job_type ENUM('jobs', 'internships', 'remote') DEFAULT 'jobs',
  employment_type VARCHAR(100) DEFAULT 'Full-Time',
  description TEXT,
  requirements TEXT,
  department VARCHAR(100),
  experience VARCHAR(100) DEFAULT '1-3 years',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
