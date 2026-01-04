const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));
app.use('/api/dreams', require('./routes/dreamRoutes'));

app.get('/', (req, res) => {
  res.send('Financial Tracker API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
