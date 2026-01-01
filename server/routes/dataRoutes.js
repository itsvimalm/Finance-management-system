const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTransactions, addTransaction, deleteTransaction } = require('../controllers/transactionController');
const { getBudgets, setBudget } = require('../controllers/budgetController');
const { getSavings, addSaving } = require('../controllers/savingsController');

const { getSettings, updateSettings } = require('../controllers/settingsController');

// Transaction Routes
router.get('/transactions', protect, getTransactions); // ?type=Income|Expenses
router.post('/transactions', protect, addTransaction);
router.delete('/transactions/:id', protect, deleteTransaction);

// Budget Routes
router.get('/budget', protect, getBudgets);
router.post('/budget', protect, setBudget);

// Savings Routes
router.get('/savings', protect, getSavings);
router.post('/savings', protect, addSaving);

// Settings Routes
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);

module.exports = router;
