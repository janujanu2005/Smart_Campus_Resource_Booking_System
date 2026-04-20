const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY date DESC');
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve or reject booking
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM bookings WHERE user_email = (SELECT email FROM users WHERE id = $1)', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add resource
const addResource = async (req, res) => {
  const { name, description, capacity } = req.body;
  if (!name || !description || !capacity) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO resources (name, description, capacity, availability) VALUES ($1, $2, $3, true) RETURNING *',
      [name, description, capacity]
    );
    res.status(201).json({ resource: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete resource
const deleteResource = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllBookings, updateBookingStatus, getAllUsers, deleteUser, addResource, deleteResource };