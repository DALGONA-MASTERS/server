const {
    createEvent,
    getAllEvents,
    updateEventProgress,
    addParticipant
} = require("../controllers/EventController");

const { checkUser } = require("../middleware/AuthMiddleware");
const router = require("express").Router();
// Routes for events
router.post('/',checkUser, createEvent);
router.get('/', getAllEvents);
router.put('/:id/progress', updateEventProgress);
router.post('/:id/participants',checkUser, addParticipant);

module.exports = router;
