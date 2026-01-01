const connectDB = require('../config/sheets');
const { ensureSheet } = require('../utils/sheetHelpers');
const { v4: uuidv4 } = require('uuid');

const generateId = () => uuidv4();
const logActivity = require('../utils/activityLogger');

const getTransactions = async (req, res) => {
    const { type, month, year } = req.query; // type = 'Income' or 'Expenses'
    const userId = req.user.id;

    try {
        const doc = await connectDB();
        const sheetName = type === 'Income' ? 'Income' : 'Expenses';
        const headers = type === 'Income'
            ? ['Id', 'UserId', 'Date', 'Source', 'Description', 'Amount', 'Mode', 'Month', 'FinancialYear']
            : ['Id', 'UserId', 'Date', 'Category', 'SubCategory', 'PaymentMethod', 'Amount', 'Month', 'FinancialYear'];

        const sheet = await ensureSheet(doc, sheetName, headers);
        const rows = await sheet.getRows();

        // Filter by User
        let userRows = rows.filter(row => row.get('UserId') === userId);

        // Optional Filter by Month/Year
        if (month) {
            userRows = userRows.filter(row => row.get('Month') === month);
        }
        if (year) {
            userRows = userRows.filter(row => row.get('FinancialYear') === year);
        }

        const data = userRows.map(row => {
            const obj = {};
            headers.forEach(h => obj[h] = row.get(h));
            return obj;
        });

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addTransaction = async (req, res) => {
    const { type } = req.body; // 'Income' or 'Expenses'
    const userId = req.user.id;
    const transactionData = req.body; // Contains Date, Amount, etc.

    // Simple validation
    if (!transactionData.Amount || !transactionData.Date) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const doc = await connectDB();
        const sheetName = type === 'Income' ? 'Income' : 'Expenses';
        // Headers must match what we expect
        const headers = type === 'Income'
            ? ['Id', 'UserId', 'Date', 'Source', 'Description', 'Amount', 'Mode', 'Month', 'FinancialYear']
            : ['Id', 'UserId', 'Date', 'Category', 'SubCategory', 'PaymentMethod', 'Amount', 'Month', 'FinancialYear'];

        const sheet = await ensureSheet(doc, sheetName, headers);

        const newRow = {
            Id: generateId(),
            UserId: userId,
            ...transactionData
        };

        await sheet.addRow(newRow);

        // Log Activity
        await logActivity(userId, req.user.email || 'Unknown', 'Add Transaction', `Added ${type}: ${transactionData.Description || ''} - ${transactionData.Amount}`);

        res.status(201).json(newRow);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const { type } = req.query; // 'Income' or 'Expenses'
    const userId = req.user.id;

    try {
        const doc = await connectDB();
        const sheetName = type === 'Income' ? 'Income' : 'Expenses';
        const headers = type === 'Income'
            ? ['Id', 'UserId', 'Date', 'Source', 'Description', 'Amount', 'Mode', 'Month', 'FinancialYear']
            : ['Id', 'UserId', 'Date', 'Category', 'SubCategory', 'PaymentMethod', 'Amount', 'Month', 'FinancialYear'];

        const sheet = await ensureSheet(doc, sheetName, headers);
        const rows = await sheet.getRows();

        const rowToDelete = rows.find(row => row.get('Id') === id && row.get('UserId') === userId);

        if (!rowToDelete) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await rowToDelete.delete();

        // Log Activity
        await logActivity(userId, req.user.email || 'Unknown', 'Delete Transaction', `Deleted ${type} ID: ${id}`);

        res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getTransactions, addTransaction, deleteTransaction };
