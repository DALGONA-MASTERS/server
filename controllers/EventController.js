<<<<<<< HEAD:controllers/EventController.js
const Event = require('../models/Event');
const User = require("../models/User");

exports.createEvent = async (req, res) => {
    const { title, startDate, endDate, description, actionType, target,privacy } = req.body;

    if (!title || !startDate || !endDate || !description || !actionType || !target) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    if (!['trees_plantation', 'waste_recycling', 'beach_cleaning', 'other'].includes(actionType)) {
        return res.status(400).json({ message: "Le type d'action est invalide." });
    }

    if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ message: "La date de début doit être antérieure à la date de fin." });
    }

    if (target <= 0) {
        return res.status(400).json({ message: "L'objectif doit être un nombre positif." });
    }

    try {
        // Vérifier si un événement avec le même titre et les mêmes dates existe déjà
        const existingEvent = await Event.findOne({ title, startDate, endDate });

        if (existingEvent) {
            return res.status(400).json({ message: 'Un événement avec les mêmes détails existe déjà.' });
        }

        const newEvent = new Event({
            title,
            startDate,
            endDate,
            description,
            actionType,
            target,
            unit: determineUnit(actionType), // Appeler une fonction pour déterminer l'unité en fonction de actionType
            createdBy: req.user.id,
            participants: [req.user.id], // Add the owner to participants
            participantsNumber: 1
        });

        await newEvent.save();

        // Add the event to the user's list of events
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { events: newEvent._id } },
            { new: true }
        );

        res.status(201).json(newEvent);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(`Erreur Serveur lors de la création de l'événement.`);
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('participants', 'name');
        if (events.length === 0) {
            return res.status(404).json({ message: 'Aucun événement trouvé.' });
        }
        res.json(events);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

exports.joinEvent = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }
        
        // Check if the user is the author of the event
        if (event.createdBy.toString() === userId.toString()) {
            return res.status(400).json({ message: "Vous êtes déjà participant. (créateur de l'event)" });
        }

        if (event.participants.includes(userId)) {
            return res.status(400).json({ message: "Vous êtes déjà inscrit à cet événement." });
        }

        // Vérifier si l'utilisateur est dans la liste noire pour cet événement
        if (event.blacklist.some(entry => entry.user.toString() === userId.toString())) {
            return res.status(403).json({ message: "Vous êtes bloqué pour participer à cet événement." });
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
                $push: { events: eventId },
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
    const userId = req.user.id;
    const { newOwnerId } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }

        // Check if the user is the author of the event
        if (event.createdBy.toString() === userId.toString()) {
            if (!newOwnerId || !event.participants.includes(newOwnerId) || newOwnerId === userId) {
                return res.status(400).json({ message: "Vous devez choisir un participant valide pour transférer l'ownership." });
            }

            // Transfer ownership to the new owner
            event.createdBy = newOwnerId;
            await event.save();

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
            await User.findByIdAndUpdate(userId, { $pull: { events: eventId } });

            return res.status(200).json({ message: "Vous avez transféré l'ownership et quitté l'événement avec succès.", newOwner: newOwnerId });
        }

        if (!event.participants.includes(userId)) {
            return res.status(400).json({ message: "Vous n'êtes pas inscrit à cet événement." });
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
        await User.findByIdAndUpdate(userId, { $pull: { events: eventId } });

        res.status(200).json({ message: "Vous avez quitté l'événement avec succès." });
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
            return res.status(404).json({ message: "Évènement non trouvé." });
        }

        // add verification to check if the logged in user is the creator of the post
        if (event.createdBy.toString() !== req.user.id) {
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
    
        // Check if the user is the author of the event
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous n'êtes pas l'auteur de cet événement." });
        }
    
        // Check if the event has already started
        if (new Date() >= new Date(event.startDate)) {
            return res.status(400).json({ message: "Vous ne pouvez pas supprimer un événement qui a déjà commencé." });
        }
    
        // Find all users who are participants of this event
        const participants = event.participants;
    
        // Delete the event
        const deletedEvent = await Event.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }
    
        // Remove the event from all users' event lists
        await User.updateMany(
            { _id: { $in: participants } },
            { $pull: { events: eventId } }
        );
    
        res.status(200).json({ message: "Événement supprimé avec succès." });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};

  
function determineUnit(actionType) {
    switch (actionType) {
        case 'trees_plantation':
            return 'trees';
        case 'waste_recycling':
            return 'kg';
        case 'beach_cleaning':
            return 'm²';
        default:
            return 'unité';
    }
}

exports.excludeParticipant = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.userId; // L'ID de l'utilisateur à exclure

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }

        // Vérifiez si l'utilisateur qui effectue la demande est le créateur de l'événement
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous n'êtes pas l'auteur de cet événement." });
        }

        // Vérifiez si l'utilisateur à exclure est un participant de l'événement
        if (!event.participants.includes(userId)) {
            return res.status(400).json({ message: "L'utilisateur n'est pas un participant de cet événement." });
        }

        // Exclure l'utilisateur de l'événement
        await Event.findByIdAndUpdate(
            eventId,
            {
                $pull: { participants: userId },
                $inc: { participantsNumber: -1 },
                $addToSet: { blacklist: { user: userId } } // Ajouter à la liste noire
            },
            { new: true }
        );

        // Supprimer l'événement de la liste des événements de l'utilisateur exclu
        await User.findByIdAndUpdate(userId, { $pull: { events: eventId } });

        res.status(200).json({ message: "L'utilisateur a été exclu de l'événement avec succès et ajouté à la liste noire." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getEventsByUser = async (req, res) => {
    const userId = req.user.id;
  
    try {
        console.log(userId)
      const events = await Event.find({ createdBy: userId }).populate("participants", "name");
      if (events.length === 0) {
        return res.status(404).json({ message: "Aucun événement trouvé pour cet utilisateur." });
      }
      res.json(events);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Erreur Serveur");
    }
};


exports.unblockParticipant = async (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.userId; // L'ID de l'utilisateur à débannir

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé." });
        }

        // Vérifiez si l'utilisateur qui effectue la demande est le créateur de l'événement
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous n'êtes pas l'auteur de cet événement." });
        }

        // Vérifiez si l'utilisateur à débannir est dans la liste noire de l'événement
        const isBlocked = event.blacklist.some(item => item.user.toString() === userId);
        if (!isBlocked) {
            return res.status(400).json({ message: "L'utilisateur n'est pas dans la liste noire de cet événement." });
        }

        // Retirer l'utilisateur de la liste noire de l'événement
        await Event.findByIdAndUpdate(
            eventId,
            { $pull: { blacklist: { user: userId } } },
            { new: true }
        );

        res.status(200).json({ message: "L'utilisateur a été débanni de l'événement avec succès." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
=======
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
>>>>>>> a4499a909691ed513a890b7c7cae34ee18bdb0f2:controller/EventController.js
};
