const {
  createEvent,
  getAllEvents,
  joinEvent,
  quitEvent,
  updateEvent,
  deleteEvent,
  excludeParticipant,
  getEventsByUser,
  unblockParticipant,
  getTrendingEvents,
  getEventOnDate,
  getAllEventsThisWeek,
  getAllEventsThisMonth,
  searchEvents,
  getPostsForEvent,
  addPostForEvent,
} = require("../controllers/EventController");

const { checkUser } = require("../middleware/AuthMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = require("express").Router();
// Routes for events

router.post("/", checkUser,upload.single("picture"), createEvent);
router.get("/", checkUser, getAllEvents);
router.put("/:id/join", checkUser, joinEvent);
router.put("/:id/leave", checkUser, quitEvent);
router.patch("/:id/", checkUser, updateEvent);
router.delete("/:id", checkUser, deleteEvent);
router.put("/:id/exclude", checkUser, excludeParticipant);
router.get("/user", checkUser, getEventsByUser);
router.put("/:id/unblock", checkUser, unblockParticipant);
// filtering events
router.get("/trending", checkUser, getTrendingEvents);
router.get("/filter/date/", checkUser, getEventOnDate);
router.get("/filter/date/week", checkUser, getAllEventsThisWeek);
router.get("filter/date/month", checkUser, getAllEventsThisMonth);
// searching an event
router.get("/search/", checkUser, searchEvents);
// getting posts for an event
router.get("/:id/posts", checkUser, getPostsForEvent);
// adding post to an event
router.post("/:id/posts", checkUser, upload.single("picture"), addPostForEvent);
module.exports = router;