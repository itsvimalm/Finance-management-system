const connectDB = require('../config/sheets');
const { ensureSheet } = require('../utils/sheetHelpers');

const logActivity = require('../utils/activityLogger');
const { v4: uuidv4 } = require('uuid');

const getSettings = async (req, res) => {
    // ... existing implementation ...
    const userId = req.user.id;
    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Settings', ['UserId', 'MonthlySavingsGoal', 'BudgetAlertPercent', 'Currency', 'Theme']);
        const rows = await sheet.getRows();

        const userSettings = rows.find(row => row.get('UserId') === userId);

        if (userSettings) {
            res.status(200).json({
                MonthlySavingsGoal: userSettings.get('MonthlySavingsGoal'),
                BudgetAlertPercent: userSettings.get('BudgetAlertPercent'),
                Currency: userSettings.get('Currency'),
                Theme: userSettings.get('Theme')
            });
        } else {
            // Default settings
            res.status(200).json({
                MonthlySavingsGoal: '0',
                BudgetAlertPercent: '80',
                Currency: 'INR',
                Theme: 'light'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateSettings = async (req, res) => {
    const userId = req.user.id;
    const { MonthlySavingsGoal, BudgetAlertPercent, Currency, Theme } = req.body;

    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Settings', ['UserId', 'MonthlySavingsGoal', 'BudgetAlertPercent', 'Currency', 'Theme']);
        const rows = await sheet.getRows();

        const userSettings = rows.find(row => row.get('UserId') === userId);

        if (userSettings) {
            userSettings.assign({ MonthlySavingsGoal, BudgetAlertPercent, Currency, Theme });
            await userSettings.save();
        } else {
            await sheet.addRow({
                UserId: userId,
                MonthlySavingsGoal,
                BudgetAlertPercent,
                Currency,
                Theme
            });
        }

        await logActivity(userId, req.user.email, 'Update Settings', 'Updated preferences');

        res.status(200).json({ MonthlySavingsGoal, BudgetAlertPercent, Currency, Theme });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getSettings, updateSettings };
