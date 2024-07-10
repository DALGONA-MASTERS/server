const {
    getStats,
    updateStats
} = require("../controllers/StatsController");

const { checkUser } = require("../middleware/AuthMiddleware");
const router = require("express").Router();
// Route to get current statistics
router.get('/', getStats);

// Route to update statistics
router.patch('/update', updateStats);

module.exports = router;
