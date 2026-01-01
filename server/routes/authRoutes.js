const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, forgotPassword, resetPassword, getAllUsers, deleteUser, getLogs } = require('../controllers/authController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Super Admin Routes
router.get('/users', protect, superAdminOnly, getAllUsers);
router.delete('/users/:id', protect, superAdminOnly, deleteUser);
router.get('/logs', protect, superAdminOnly, getLogs);

module.exports = router;
