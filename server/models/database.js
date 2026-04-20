const pool = require('../config/db');

const getUserByEmail = (email) => {
  return pool.query('SELECT * FROM users WHERE email = $1', [email]);
};

const createUser = (email, password, fullName) => {
  return pool.query(
    'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
    [email, password, fullName, 'student']
  );
};

const getAllResources = () => {
  return pool.query('SELECT * FROM resources WHERE availability = true ORDER BY id');
};

const getResourceById = (id) => {
  return pool.query('SELECT * FROM resources WHERE id = $1', [id]);
};

const createBooking = (userEmail, resource, date, time) => {
  return pool.query(
    'INSERT INTO bookings (user_email, resource, date, time, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userEmail, resource, date, time, 'confirmed']
  );
};

const checkConflict = (resource, date, time) => {
  return pool.query(
    `SELECT * FROM bookings 
     WHERE resource = $1 
     AND date = $2 
     AND time = $3
     AND status = 'confirmed'`,
    [resource, date, time]
  );
};

const getUserBookings = (userEmail) => {
  return pool.query(
    `SELECT * FROM bookings WHERE user_email = $1 ORDER BY date DESC`,
    [userEmail]
  );
};

const cancelBooking = (bookingId) => {
  return pool.query(
    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
    ['cancelled', bookingId]
  );
};

module.exports = {
  getUserByEmail,
  createUser,
  getAllResources,
  getResourceById,
  createBooking,
  checkConflict,
  getUserBookings,
  cancelBooking
};