const express = require('express');
const router = express.Router();
const { getDreams, addDream, addFundsToDream, deleteDream } = require('../controllers/dreamController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDreams);
router.post('/', protect, addDream);
router.post('/add-funds', protect, addFundsToDream);
router.delete('/:id', protect, deleteDream);

module.exports = router;
