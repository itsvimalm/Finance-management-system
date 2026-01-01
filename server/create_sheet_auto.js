const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

const create = async () => {
    try {
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file'
            ],
        });

        console.log("Creating new spreadsheet...");
        const doc = await GoogleSpreadsheet.createNewSpreadsheetDocument(serviceAccountAuth, { title: 'Financial Tracker DB' });

        console.log(`SUCCESS_SHEET_ID:${doc.spreadsheetId}`);
    } catch (error) {
        console.error("Error creating sheet:", error);
    }
};

create();
