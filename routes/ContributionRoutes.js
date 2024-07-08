const {
    addContribution,
    updateContribution,
    getUserContributions
} = require("../controllers/ContributionController");

const { checkUser } = require("../middleware/AuthMiddleware");
const router = require("express").Router();

// Route for contributions
router.post('/',checkUser, addContribution);
router.put('/:contributionId',checkUser, updateContribution);

router.get('/',checkUser, getUserContributions);

module.exports = router;