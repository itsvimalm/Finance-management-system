const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/sheets');
const { ensureSheet } = require('../utils/sheetHelpers');

const logActivity = require('../utils/activityLogger');

const generateToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Users', ['UserId', 'Name', 'Email', 'PasswordHash', 'CreatedAt', 'Role']);

        const rows = await sheet.getRows();
        const userExists = rows.find(row => row.get('Email') === email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Assign role: First user is 'superadmin', else 'user'
        const role = rows.length === 0 ? 'superadmin' : 'user';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = Date.now().toString();

        await sheet.addRow({
            UserId: userId,
            Name: name,
            Email: email,
            PasswordHash: hashedPassword,
            CreatedAt: new Date().toISOString(),
            Role: role,
        });

        // Log Activity
        await logActivity(userId, name, 'User Registration', `User registered as ${role}`);

        res.status(201).json({
            _id: userId,
            name,
            email,
            role,
            token: generateToken(userId, email, role),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Users', ['UserId', 'Name', 'Email', 'PasswordHash', 'CreatedAt', 'Role']);

        // Performance note: Fetching all users is slow for large datasets.
        const rows = await sheet.getRows();
        const user = rows.find(row => row.get('Email') === email);

        if (user && (await bcrypt.compare(password, user.get('PasswordHash')))) {
            const role = user.get('Role') || 'user'; // Default to user if undefined

            // Log Activity
            await logActivity(user.get('UserId'), user.get('Name'), 'User Login', 'User logged in successfully');

            res.json({
                _id: user.get('UserId'),
                name: user.get('Name'),
                email: user.get('Email'),
                role: role,
                token: generateToken(user.get('UserId'), user.get('Email'), role),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

const sendEmail = require('../utils/sendEmail');

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Users', ['UserId', 'Name', 'Email', 'PasswordHash', 'CreatedAt']);

        const rows = await sheet.getRows();
        const user = rows.find(row => row.get('Email') === email);

        if (!user) {
            // Check security best practice: don't reveal if user exists, but for this app we'll be honest
            // Or act as if sent
            return res.status(200).json({ message: 'If account exists, email sent' });
        }

        // Generate dummy reset token (in production, save this token to DB with expiry)
        const resetToken = jwt.sign({ id: user.get('UserId') }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // This would be the link to the reset page (frontend)
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { color: #2563eb; font-size: 24px; font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">
                            CellFinanc
                        </div>
                    </div>
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.get('Name')},</p>
                    <p>We received a request to reset your password for your CellFinanc account. If you didn't make this request, you can safely ignore this email.</p>
                    <p style="text-align: center;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
                    <div class="footer">
                        &copy; 2026 CellFinanc. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await sendEmail({
                email: user.get('Email'),
                subject: 'Password Reset Request',
                message
            });
            res.status(200).json({ message: 'Email Sent' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const doc = await connectDB();
        const sheet = doc.sheetsByTitle['Users'];
        const rows = await sheet.getRows();

        const userRow = rows.find(row => row.get('UserId') === decoded.id);

        if (!userRow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password
        userRow.set('PasswordHash', hashedPassword);
        await userRow.save();

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Users', ['UserId', 'Name', 'Email', 'PasswordHash', 'CreatedAt', 'Role']);
        const rows = await sheet.getRows();

        const users = rows.map(row => ({
            _id: row.get('UserId'),
            name: row.get('Name'),
            email: row.get('Email'),
            role: row.get('Role') || 'user',
            createdAt: row.get('CreatedAt')
        }));

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Users', ['UserId', 'Name', 'Email', 'PasswordHash', 'CreatedAt', 'Role']);
        const rows = await sheet.getRows();

        const userRow = rows.find(row => row.get('UserId') === req.params.id);

        if (!userRow) {
            return res.status(404).json({ message: 'User not found' });
        }

        await userRow.delete();
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getLogs = async (req, res) => {
    try {
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'ActivityLogs', ['LogId', 'UserId', 'UserName', 'Action', 'Details', 'Timestamp']);
        const rows = await sheet.getRows();

        const logs = rows.map(row => ({
            id: row.get('LogId'),
            userId: row.get('UserId'),
            userName: row.get('UserName'),
            action: row.get('Action'),
            details: row.get('Details'),
            timestamp: row.get('Timestamp')
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first

        res.status(200).json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword, getAllUsers, deleteUser, getLogs };
