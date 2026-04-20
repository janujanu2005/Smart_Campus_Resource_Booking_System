const db = require('../models/database');

const createBooking = async (req, res) => {
  const { userEmail, resource, date, time } = req.body;

  if (!userEmail || !resource || !date || !time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check for conflicts
    const conflict = await db.checkConflict(resource, date, time);

    if (conflict.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Time slot already booked for this resource' 
      });
    }

    // Create booking
    const result = await db.createBooking(userEmail, resource, date, time);
    const booking = result.rows[0];

    res.status(201).json({
      message: 'Booking confirmed',
      booking: {
        id: booking.id,
        resource: booking.resource,
        date: booking.date,
        time: booking.time,
        status: booking.status
      }
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Server error creating booking' });
  }
};

const getUserBookings = async (req, res) => {
  const { userId } = req.params;

  try {
    const userEmail = decodeURIComponent(userId);
    const result = await db.getUserBookings(userEmail);
    res.json({
      bookings: result.rows
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.cancelBooking(id);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking: result.rows[0]
    });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Server error cancelling booking' });
  }
};

module.exports = { createBooking, getUserBookings, cancelBooking };