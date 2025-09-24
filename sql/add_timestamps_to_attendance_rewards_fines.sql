-- Add timestamp columns to attendance_rewards_fines table
-- This migration adds created_at and updated_at columns to the attendance_rewards_fines table

ALTER TABLE attendance_rewards_fines 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add indexes for better performance
CREATE INDEX idx_attendance_rewards_fines_created_at ON attendance_rewards_fines(created_at);
CREATE INDEX idx_attendance_rewards_fines_updated_at ON attendance_rewards_fines(updated_at);
