const connectDB = require('../config/sheets');
const { ensureSheet } = require('../utils/sheetHelpers');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/activityLogger');

const generateId = () => uuidv4();

const getDreams = async (req, res) => {
    const userId = req.user.id;
    try {
        const doc = await connectDB();
        const headers = ['DreamId', 'UserId', 'ItemName', 'TargetAmount', 'CurrentSaved', 'Status', 'CreatedAt', 'LastUpdated'];
        const sheet = await ensureSheet(doc, 'Dreams', headers);
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

const addDream = async (req, res) => {
    const userId = req.user.id;
    const { ItemName, TargetAmount } = req.body;

    if (!ItemName || !TargetAmount) {
        return res.status(400).json({ message: 'Item Name and Target Amount are required' });
    }

    try {
        const doc = await connectDB();
        const headers = ['DreamId', 'UserId', 'ItemName', 'TargetAmount', 'CurrentSaved', 'Status', 'CreatedAt', 'LastUpdated'];
        const sheet = await ensureSheet(doc, 'Dreams', headers);

        const newRow = {
            DreamId: generateId(),
            UserId: userId,
            ItemName,
            TargetAmount,
            CurrentSaved: 0,
            Status: 'In Progress',
            CreatedAt: new Date().toISOString(),
            LastUpdated: new Date().toISOString()
        };

        await sheet.addRow(newRow);
        await logActivity(userId, req.user.email, 'Add Dream', `Added dream goal: ${ItemName} for ${TargetAmount}`);
        res.status(201).json(newRow);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addFundsToDream = async (req, res) => {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name || 'Dreamer';
    const { dreamId, amount } = req.body;

    if (!dreamId || !amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Valid Dream ID and positive amount are required' });
    }

    try {
        const doc = await connectDB();
        const headers = ['DreamId', 'UserId', 'ItemName', 'TargetAmount', 'CurrentSaved', 'Status', 'CreatedAt', 'LastUpdated'];
        const sheet = await ensureSheet(doc, 'Dreams', headers);
        const rows = await sheet.getRows();

        const row = rows.find(r => r.get('DreamId') === dreamId && r.get('UserId') === userId);

        if (!row) {
            return res.status(404).json({ message: 'Dream not found' });
        }

        const currentSaved = parseFloat(row.get('CurrentSaved') || 0);
        const targetAmount = parseFloat(row.get('TargetAmount'));
        const newSaved = currentSaved + parseFloat(amount);

        row.set('CurrentSaved', newSaved);
        row.set('LastUpdated', new Date().toISOString());

        let emailSent = false;

        // Check for Achievement
        if (newSaved >= targetAmount && row.get('Status') !== 'Achieved') {
            row.set('Status', 'Achieved');

            // Send Notification Email
            const subject = `Dream Achieved: You can now buy ${row.get('ItemName')}!`;
            const message = `
                <h1>Congratulations, ${userName}!</h1>
                <p>You have successfully saved enough money to buy your dream item: <strong>${row.get('ItemName')}</strong>.</p>
                <p><strong>Goal Target:</strong> ${targetAmount}</p>
                <p><strong>Total Saved:</strong> ${newSaved}</p>
                <p>Go ahead and treat yourself!</p>
                <hr>
                <p>Your CellFinanc Team</p>
            `;

            try {
                await sendEmail({
                    email: userEmail,
                    subject: subject,
                    message: message
                });
                emailSent = true;
                console.log(`Dream achievement email sent to ${userEmail}`);
            } catch (emailErr) {
                console.error('Failed to send dream email:', emailErr);
            }
        }

        await row.save();
        await logActivity(userId, userEmail, 'Add Funds to Dream', `Added ${amount} to ${row.get('ItemName')}. New Total: ${newSaved}`);

        res.status(200).json({
            message: 'Funds added successfully',
            currentSaved: newSaved,
            status: row.get('Status'),
            emailSent
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteDream = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const doc = await connectDB();
        const headers = ['DreamId', 'UserId', 'ItemName', 'TargetAmount', 'CurrentSaved', 'Status', 'CreatedAt', 'LastUpdated'];
        const sheet = await ensureSheet(doc, 'Dreams', headers);
        const rows = await sheet.getRows();

        const row = rows.find(r => r.get('DreamId') === id && r.get('UserId') === userId);

        if (!row) {
            return res.status(404).json({ message: 'Dream not found' });
        }

        const itemName = row.get('ItemName');
        await row.delete();
        await logActivity(userId, req.user.email, 'Delete Dream', `Deleted dream: ${itemName}`);

        res.status(200).json({ message: 'Dream deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = { getDreams, addDream, addFundsToDream, deleteDream };
