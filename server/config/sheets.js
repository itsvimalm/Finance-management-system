const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

let doc = null;

const connectDB = async () => {
    if (doc) return doc;

    try {
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

        await doc.loadInfo();
        console.log(`Connected to sheet: ${doc.title}`);
        return doc;
    } catch (error) {
        console.error('Google Sheets connection error:', error);
        throw error;
    }
};

module.exports = connectDB;
