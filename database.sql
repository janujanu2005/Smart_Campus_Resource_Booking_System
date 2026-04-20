-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  capacity INT,
  resource_type VARCHAR(100),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id INT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_double_booking UNIQUE(resource_id, booking_date, start_time, end_time)
);

-- Insert sample resources
INSERT INTO resources (name, description, location, capacity, resource_type) VALUES
('Computer Lab A', 'Lab with 30 computers', 'Building 1, Floor 2', 30, 'Lab'),
('Meeting Room 101', 'Small meeting room with projector', 'Building 2, Floor 1', 10, 'Room'),
('Sports Court 1', 'Basketball and volleyball court', 'Campus Ground', 20, 'Sport Facility'),
('Library Study Room', 'Quiet study area', 'Library, Floor 3', 8, 'Study Room'),
('Cafeteria Hall', 'Large multipurpose hall', 'Building 3, Ground', 100, 'Hall')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);