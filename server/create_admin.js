require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/sheets');
const { ensureSheet } = require('./utils/sheetHelpers');

const createAdmin = async () => {
    try {
        console.log('Connecting to database...');
        const doc = await connectDB();
        const sheet = await ensureSheet(doc, 'Users', ['UserId', 'Name', 'Email', 'PasswordHash', 'CreatedAt', 'Role']);
        const rows = await sheet.getRows();

        const email = 'admin@fintrack.com';
        const password = 'admin123';
        const name = 'Super Admin';


        console.log(`Checking for user: ${email}`);
        const userRow = rows.find(row => row.get('Email') === email);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (userRow) {
            console.log('User exists. Updating role and password...');
            userRow.set('Role', 'superadmin');
            userRow.set('PasswordHash', hashedPassword);
            userRow.set('Name', name); // Update name just in case
            await userRow.save();
            console.log('User updated successfully.');
        } else {
            console.log('User does not exist. Creating new superadmin...');
            const userId = Date.now().toString();
            await sheet.addRow({
                UserId: userId,
                Name: name,
                Email: email,
                PasswordHash: hashedPassword,
                CreatedAt: new Date().toISOString(),
                Role: 'superadmin',
            });
            console.log('User created successfully.');
        }

        console.log('-----------------------------------');
        console.log('Login Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');
        process.exit(0);

    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
