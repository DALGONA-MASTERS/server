const Event = require('../models/Event');
const User = require("../models/User");

exports.createEvent = async (req, res) => {
    const { title, startDate, endDate, description, actionType, target, privacy } = req.body;

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
            participants: [req.user.id], // Ajouter le créateur aux participants
            participantsNumber: 1,
            privacy
        });

        await newEvent.save();

        // Ajouter l'événement à la liste des événements de l'utilisateur
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { events: newEvent._id } },
            { new: true }
        );

        // Sauvegarder le nouvel événement
        await newEvent.save();

        // Recharger l'événement avec les noms des participants peuplés
        const populatedEvent = await Event.findById(newEvent._id).populate('participants', 'name');

        res.status(201).json(populatedEvent);
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
        res.status(200).json(events);
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
            return res.status(400).json({ message: "Vous êtes déjà participant (créateur de l'événement)." });
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
        ).populate('participants', 'name'); // Populate participants with 'name'

        await User.findByIdAndUpdate(
            userId,
            { $push: { events: eventId } },
            { new: true }
        );

        res.status(200).json(updatedEvent);
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

        const now = new Date();

        // Check if the user is the author of the event
        if (event.createdBy.toString() === userId.toString()) {
            // Check if the event has started
            if (event.startDate <= now) {
                return res.status(400).json({ message: "Vous ne pouvez pas quitter l'événement car il a déjà commencé." });
            }

            // Check if the user is the only participant
            if (event.participants.length === 1) {
                // Delete the event as there are no other participants
                const deletedEvent = event;
                await event.deleteOne();

                // Remove event from user's events
                await User.findByIdAndUpdate(userId, { $pull: { events: eventId } });

                return res.status(200).json(deletedEvent);
            }

            if (!newOwnerId || !event.participants.includes(newOwnerId) || newOwnerId === userId) {
                return res.status(400).json({ message: "Vous devez choisir un participant valide pour transférer l'ownership." });
            }

            // Transfer ownership to the new owner
            event.createdBy = newOwnerId;
            await event.save();

            // Remove user from event participants
            await Event.findByIdAndUpdate(
                eventId,
                {
                    $pull: { participants: userId },
                    $inc: { participantsNumber: -1 },
                },
                { new: true }
            );

            // Remove event from user's events
            await User.findByIdAndUpdate(userId, { $pull: { events: eventId } });

            // Re-populate participants before sending response
            const updatedEvent = await Event.findById(eventId).populate('participants', 'name');

            return res.status(200).json(updatedEvent);
        }

        if (!event.participants.includes(userId)) {
            return res.status(400).json({ message: "Vous n'êtes pas inscrit à cet événement." });
        }

        // Remove user from event participants
        await Event.findByIdAndUpdate(
            eventId,
            {
                $pull: { participants: userId },
                $inc: { participantsNumber: -1 },
            },
            { new: true }
        );

        // Remove event from user's events
        await User.findByIdAndUpdate(userId, { $pull: { events: eventId } });

        // Re-populate participants before sending response
        const updatedEvent = await Event.findById(eventId).populate('participants', 'name');

        return res.status(200).json(updatedEvent);
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
        let updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });

        // Vérifier si l'événement a été mis à jour avec succès
        if (!updatedEvent) {
            return res.status(404).json({ message: "Évènement non trouvé lors de la mise à jour." });
        }

        await updatedEvent.populate('participants', 'name');
        res.status(200).json(updatedEvent);
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
    
        res.status(200).json({ _id: eventId });
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

        // Vérifiez si l'utilisateur à exclure est le créateur de l'événement
        if (event.createdBy.toString() === userId.toString()) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous exclure vous-même de l'événement." });
        }

        // Vérifiez si l'utilisateur à exclure est un participant de l'événement
        if (!event.participants.includes(userId)) {
            return res.status(400).json({ message: "L'utilisateur n'est pas un participant de cet événement." });
        }

        // Exclure l'utilisateur de l'événement
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                $pull: { participants: userId },
                $inc: { participantsNumber: -1 },
                $addToSet: { blacklist: userId } // Ajouter à la liste noire
            },
            { new: true }
        ).populate('participants', 'name');

        // Supprimer l'événement de la liste des événements de l'utilisateur exclu
        await User.findByIdAndUpdate(userId, { $pull: { events: eventId } });

        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await Event.findById(eventId).populate('participants', 'name');

        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        res.status(200).json(event);

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
        const isBlocked = event.blacklist.some(item => item.toString() === userId);
        if (!isBlocked) {
            return res.status(400).json({ message: "L'utilisateur n'est pas dans la liste noire de cet événement." });
        }

        // Retirer l'utilisateur de la liste noire de l'événement
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { $pull: { blacklist: userId } },
            { new: true }
        ).populate('participants', 'name');

        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
};

// filtering events
// trending events
exports.getTrendingEvents = async (req, res) => {
  try {
    // Find events sorted by the number of participants in descending order
    const trendingEvents = await Event.find()
      .sort({ participantsNumber: -1 }) // Sort by participantsNumber in descending order
      .limit(10) // Limit to top 10 trending events
      .populate("participants", "name"); // Populate participants with their names

    if (trendingEvents.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun événement tendance trouvé." });
    }

    res.status(200).json(trendingEvents);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur Serveur");
  }
};
// filter by date
// get events on a particular date
exports.getEventOnDate = async (req, res) => {
  const startDate = new Date(req.query.startDate);
  try {
    const events = await Event.find({ startDate: { $eq: startDate } });
    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun événement trouvé pour cette date." });
    }
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur Serveur");
  }
};
// get all events for this week

exports.getAllEventsThisWeek = async (req, res) => {
  const currentDate = new Date();
  const startDateOfWeek = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - currentDate.getDay()
  );
  const endDateOfWeek = new Date(startDateOfWeek.getTime() + 604800000); // 604800000 = 7 days * 24 hours * 60 minutes * 60 seconds
  try {
    const events = await Event.find({
      startDate: { $gte: startDateOfWeek, $lte: endDateOfWeek },
    });
    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun événement trouvé cette semaine." });
    }
    res.json(events);
  } catch (error) {
    console.log(error.message);
  }
};
// get all events for this month

exports.getAllEventsThisMonth = async (req, res) => {
  const currentDate = new Date();
  const startDateOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endDateOfMonth = new Date(startDateOfMonth.getTime() + 2629743000); // 2629743000 = 31 days * 24 hours * 60 minutes * 60 seconds
  try {
    const events = await Event.find({
      startDate: { $gte: startDateOfMonth, $lte: endDateOfMonth },
    });
    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun événement trouvé ce mois." });
    }
    res.json(events);
  } catch (error) {
    console.log(error.message);
  }
};
//  search an event

exports.searchEvents = async (req, res) => {
  const searchText = req.query.searchText;
  try {
    const events = await Event.find({
      $text: { $search: searchText },
    })
      .populate("participants", "name")
      .sort({ participantsNumber: -1 });
    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun événement trouvé pour cette recherche." });
    }
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur Serveur");
  }
};