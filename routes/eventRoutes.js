const {
<<<<<<< HEAD
    createEvent,
    getAllEvents,
    joinEvent,
    quitEvent,
    updateEvent,
    deleteEvent,
    excludeParticipant,
    getEventsByUser,
    unblockParticipant
} = require("../controllers/EventController");

const { checkUser } = require("../middleware/AuthMiddleware");
const router = require("express").Router();
// Routes for events

router.post("/", checkUser, createEvent);
router.get("/", getAllEvents);
router.put("/:id/join", checkUser, joinEvent);
router.put("/:id/leave", checkUser, quitEvent);
router.patch("/:id/", checkUser, updateEvent);
router.delete("/:id", checkUser,deleteEvent);
router.post('/:id/exclude',checkUser, excludeParticipant);
router.get('/user',checkUser, getEventsByUser);
router.put('/:id/unblock', unblockParticipant);
=======
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  joinEvent,
  quitEvent,
} = require("../controller/EventController");
const { checkUser } = require("../middleware/authMiddleware");
const router = require("express").Router();
// Routes for events
router.post("/", checkUser, createEvent);
router.get("/", getAllEvents);
router.patch("/:id/", checkUser, updateEvent);
router.put("/:id/join", checkUser, joinEvent);
router.put("/:id/leave", checkUser, quitEvent);
router.delete("/:id", deleteEvent);

>>>>>>> a4499a909691ed513a890b7c7cae34ee18bdb0f2
module.exports = router;
