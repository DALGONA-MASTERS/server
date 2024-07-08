const {
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

module.exports = router;
