const connectDB = require('../config/sheets');
const { ensureSheet } = require('../utils/sheetHelpers');
const { v4: uuidv4 } = require('uuid');

const generateId = () => uuidv4();

const logActivity = require('../utils/activityLogger');

const getSavings = async (req, res) => {
    // ... existing implementation
    const userId = req.user.id;
    try {
        const doc = await connectDB();
        const headers = ['Id', 'UserId', 'Type', 'MonthlyAmount', 'GoalAmount', 'StartDate', 'ExpectedReturn'];
        const sheet = await ensureSheet(doc, 'Savings_Investments', headers);
        const rows = await sheet.getRows();

        const userRows = rows.filter(row => row.get('UserId') === userId);
        const data = userRows.map(row => {
            let obj = {};
            headers.forEach(h => obj[h] = row.get(h));
            return obj;
        });

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addSaving = async (req, res) => {
    const userId = req.user.id;
    const { Type, MonthlyAmount, GoalAmount, StartDate, ExpectedReturn } = req.body;

    try {
        const doc = await connectDB();
        const headers = ['Id', 'UserId', 'Type', 'MonthlyAmount', 'GoalAmount', 'StartDate', 'ExpectedReturn'];
        const sheet = await ensureSheet(doc, 'Savings_Investments', headers);

        const newRow = {
            Id: generateId(),
            UserId: userId,
            Type,
            MonthlyAmount,
            GoalAmount,
            StartDate,
            ExpectedReturn
        };
        await sheet.addRow(newRow);
        await logActivity(userId, req.user.email, 'Add Saving/Investment', `Type: ${Type}, Amount: ${MonthlyAmount}`);
        res.status(201).json(newRow);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getSavings, addSaving };
