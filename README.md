# Financial Tracker (India)

A production-ready Fintech Web App using Google Sheets as the database.

## Architecture

- **Frontend**: React (Vite) + Vanilla CSS (Fintech Theme) + Recharts
- **Backend**: Node.js + Express + `google-spreadsheet`
- **Database**: Google Sheets

## Setup Instructions

### 1. Google Sheets & API Setup

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the **Google Sheets API**.
4.  Go to **Credentials** -> **Create Credentials** -> **Service Account**.
5.  Create the service account and download the JSON key file.
6.  Open the JSON file and copy the `client_email` and `private_key`.
7.  Create a **New Google Sheet**.
8.  **Share** the sheet with the `client_email` with **Editor** access.
9.  **Copy the Sheet ID**: Open your Google Sheet. The URL looks like `https://docs.google.com/spreadsheets/d/LONG_ID_HERE/edit`. Copy that `LONG_ID_HERE` part.

### 2. Configure Backend

1.  Open `server/.env`.
2.  Paste your `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
3.  Paste your `GOOGLE_PRIVATE_KEY` (Keep the `\n` newlines if copying from one line, or ensure it's a string).
4.  Paste your `GOOGLE_SHEET_ID`.
5.  Set a `JWT_SECRET`.

### 3. Install & Run

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## Features

- **Dashboard**: Monthly Income, Expenses, Balance, and Category Breakdown.
- **Income/Expenses**: Add, View, and Delete transactions.
- **Auth**: User registration and login (Users stored in the Sheet).
- **Responsive**: Mobile-first design.
- **Dark Mode**: System default or customizable via CSS.

## Sheet Structure (Auto-created on first use)
- **Users**: UserId, Name, Email...
- **Income**: ...
- **Expenses**: ...
- **Budget**: ...
- **Savings_Investments**: ...
