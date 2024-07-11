const {
    addContribution,
    updateContribution,
    getUserContributions,
    validateContribution,
    getAllContributions,
    getContributionsByEvent,
    getContributionsByActionTypeAndMonth
} = require("../controllers/ContributionController");

const { checkUser } = require("../middleware/AuthMiddleware");
const router = require("express").Router();


router.post('/',checkUser, addContribution);
router.put('/:contributionId',checkUser, updateContribution);
router.post('/validate/:contributionId',checkUser, validateContribution);
router.get('/user',checkUser, getUserContributions);
router.get('/', getAllContributions);
router.get('/:id', getContributionsByEvent);
router.get('/actionType/:actionType/monthly', checkUser, getContributionsByActionTypeAndMonth);


module.exports = router;