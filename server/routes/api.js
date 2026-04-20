const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const resourceController = require('../controllers/resourceController');
const bookingController = require('../controllers/bookingController');
const adminController = require('../controllers/adminController');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Resource routes
router.get('/resources', resourceController.getResources);

// Booking routes
router.post('/book', bookingController.createBooking);
router.get('/bookings/:userId', bookingController.getUserBookings);
router.delete('/cancel/:id', bookingController.cancelBooking);

// Admin routes
router.get('/admin/bookings', adminController.getAllBookings);
router.patch('/admin/booking/:id', adminController.updateBookingStatus);
router.get('/admin/users', adminController.getAllUsers);
router.delete('/admin/user/:id', adminController.deleteUser);
router.post('/admin/resource', adminController.addResource);
router.delete('/admin/resource/:id', adminController.deleteResource);

module.exports = router;