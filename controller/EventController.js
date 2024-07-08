const Event = require("../models/Events");
const User = require("../models/User");
const { findByIdAndDelete } = require("../models/Events");

exports.createEvent = async (req, res) => {
  const {
    title,
    startDate,
    endDate,
    description,
    actionType,
    target,
    privacy,
  } = req.body;

  if (
    !title ||
    !startDate ||
    !endDate ||
    !description ||
    !actionType ||
    !target ||
    !privacy
  ) {
    return res
      .status(400)
      .json({ message: "Tous les champs sont obligatoires." });
  }

  if (
    ![
      "trees_plantation",
      "waste_recycling",
      "beach_cleaning",
      "other",
    ].includes(actionType)
  ) {
    return res.status(400).json({ message: "Le type d'action est invalide." });
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      message: "La date de début doit être antérieure à la date de fin.",
    });
  }

  if (target <= 0) {
    return res
      .status(400)
      .json({ message: "L'objectif doit être un nombre positif." });
  }

  try {
    // Vérifier si un événement avec le même titre et les mêmes dates existe déjà
    const existingEvent = await Event.findOne({ title, startDate, endDate });

    if (existingEvent) {
      return res
        .status(400)
        .json({ message: "Un événement avec les mêmes détails existe déjà." });
    }

    const newEvent = new Event({
      title,
      startDate,
      endDate,
      description,
      actionType,
      target,
      createdBy: req.user.id,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .send(
        `Erreur Serveur lors de la création de l'événement. ID Utilisateur: ${req.user.id}`
      );
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("participants", "name");
    if (events.length === 0) {
      return res.status(404).json({ message: "Aucun événement trouvé." });
    }
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur Serveur");
  }
};

exports.joinEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }
    if (event.participants.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Vous êtes déjà inscrit à cet événement." });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId },
      {
        $push: { participants: userId },
        $inc: { participantsNumber: 1 },
      },
      { new: true }
    );

    res.json(updatedEvent);

    await User.findByIdAndUpdate(
      userId,
      {
        $push: { Events: eventId },
      },
      { new: true }
    ).catch((error) => {
      return res.json({ error: error.message });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur Serveur");
  }
};

exports.quitEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }
    if (!event.participants.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Vous n'êtes pas inscrit à cet événement." });
    }

    // Remove user from event participants
    await Event.findByIdAndUpdate(
      { _id: eventId },
      {
        $pull: { participants: userId },
        $inc: { participantsNumber: -1 },
      },
      { new: true }
    );

    // Remove event from user's events
    await User.findByIdAndUpdate(userId, { $pull: { Events: eventId } });

    res
      .status(200)
      .json({ message: "Vous avez quitté l'événement avec succès." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    let event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }
    // add verification to check if the logged in user is the creator of the post
    if (event.createdBy.toString() !== req.user) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas l'auteur de cet événement." });
    }
    let updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
    }).catch((error) => {
      return res.json({ error: error.message });
    });
    res.json(updatedEvent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur Serveur");
  }
};
exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }
    if (event.createdBy.toString() !== req.user) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas l'auteur de cet événement." });
    }
    const deletedPost = await findByIdAndDelete(eventId);
    if (!deletedPost) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }
  } catch (error) {
    res.json({
      error: error.message,
    });
  }
};
