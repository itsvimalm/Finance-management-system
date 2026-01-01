const connectDB = require('../config/sheets');
const { ensureSheet } = require('../utils/sheetHelpers');
const { v4: uuidv4 } = require('uuid');

const generateId = () => uuidv4();

const logActivity = require('../utils/activityLogger');

const getBudgets = async (req, res) => {
    // ... existing implementation ...
    const userId = req.user.id;

    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Budget', ['Id', 'UserId', 'Category', 'MonthlyBudget']);
        const rows = await sheet.getRows();

        const userRows = rows.filter(row => row.get('UserId') === userId);

        const data = userRows.map(row => ({
            Id: row.get('Id'),
            Category: row.get('Category'),
            MonthlyBudget: row.get('MonthlyBudget')
        }));

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const setBudget = async (req, res) => {
    const userId = req.user.id;
    const { Category, MonthlyBudget } = req.body;

    // Check if budget for category exists, update it, else create.
    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Budget', ['Id', 'UserId', 'Category', 'MonthlyBudget']);
        const rows = await sheet.getRows();

        const existingRow = rows.find(row => row.get('UserId') === userId && row.get('Category') === Category);

        if (existingRow) {
            existingRow.assign({ MonthlyBudget });
            await existingRow.save();
            await logActivity(userId, req.user.email, 'Update Budget', `Category: ${Category}, Amount: ${MonthlyBudget}`);
            res.status(200).json({ Id: existingRow.get('Id'), Category, MonthlyBudget });
        } else {
            const newRow = {
                Id: generateId(),
                UserId: userId,
                Category,
                MonthlyBudget
            };
            await sheet.addRow(newRow);
            await logActivity(userId, req.user.email, 'Set Budget', `Category: ${Category}, Amount: ${MonthlyBudget}`);
            res.status(201).json(newRow);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getBudgets, setBudget };
