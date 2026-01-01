const { ensureSheet } = require('../utils/sheetHelpers');
const connectDB = require('../config/sheets');

const logActivity = async (userId, userName, action, details) => {
    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'ActivityLogs', ['LogId', 'UserId', 'UserName', 'Action', 'Details', 'Timestamp']);

        await sheet.addRow({
            LogId: Date.now().toString(),
            UserId: userId,
            UserName: userName,
            Action: action,
            Details: details,
            Timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error to avoid blocking the main action
    }
};

module.exports = logActivity;
