const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
    const { title, startDate, endDate, description, actionType, target } = req.body;

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
            createdBy: req.user.id
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(`Erreur Serveur lors de la création de l'événement. ID Utilisateur: ${req.user.id}`);
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

exports.addParticipant = async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        if (event.participants.includes(req.user.id)) {
            return res.status(400).json({ message: 'Vous êtes déjà inscrit à cet événement.' });
        }

        event.participants.push(req.user.id);
        await event.save();
        res.json(event);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

exports.updateEventProgress = async (req, res) => {
    const eventId = req.params.id;
    const { progress } = req.body;

    if (progress === undefined) {
        return res.status(400).json({ message: 'Le progrès est obligatoire.' });
    }

    try {
        let event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        event.progress = progress;
        await event.save();
        res.json(event);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};
