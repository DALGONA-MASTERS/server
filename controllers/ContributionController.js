const Contribution = require('../models/Contribution');
const Event = require('../models/Event');
const Stats = require('../models/Stats');

exports.addContribution = async (req, res) => {
    const { eventId, value } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        // Vérifier si l'utilisateur est un participant de l'événement
        if (!event.participants.includes(req.user.id)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à ajouter une contribution à cet événement." });
        }

        const newContribution = new Contribution({
            event: eventId,
            user: req.user.id,
            value,
            actionType: event.actionType
        });

        await newContribution.save();
        res.status(200).json(newContribution);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

exports.updateContribution = async (req, res) => {
    const { contributionId } = req.params;
    const { value } = req.body;

    try {
        let contribution = await Contribution.findById(contributionId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution non trouvée.' });
        }

        if (contribution.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à mettre à jour cette contribution." });
        }

        contribution.value = value;
        await contribution.save();

        res.status(200).json(contribution);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

exports.validateContribution = async (req, res) => {
    const { contributionId } = req.params;

    try {
        let contribution = await Contribution.findById(contributionId).populate('event');
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution non trouvée.' });
        }
        // Vérifier si l'utilisateur est l'auteur de l'événement de la contribution
        const event = await Event.findById(contribution.event);
        
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à valider cette contribution." });
        }

        contribution.validated = true;
        await contribution.save();
        
        event.progress += contribution.value;
        await event.save();
        
        await updateGlobalStats(contribution.actionType, contribution.value);
        
        res.status(200).json(contribution);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

const updateGlobalStats = async (actionType, value) => {
    try {
        // Trouver les statistiques globales existantes ou les créer si elles n'existent pas
        let stats = await Stats.findOne({});
        if (!stats) {
            stats = new Stats();
        }
        console.log(stats);
        
        actionType = String(actionType);

        // Vérifiez que actionsMap est bien une Map et qu'elle contient actionType
        let actionsMap = stats.actions;
        if (!actionsMap) {
            actionsMap = new Map();
        }

        if (!actionsMap.has(actionType)) {
            console.warn(`Action type '${actionType}' not found in actionsMap.`);
            return;
        }

        console.log(actionsMap.get(actionType).progress);
        console.log(actionsMap.get(actionType).target);
        console.log(actionsMap.get(actionType).unit);
        console.log(actionsMap.get(actionType).value);

        console.log("passed");

        console.log(actionsMap);

        // Calculer la valeur de l'action si possible
        const progress = actionsMap.get(actionType).progress + value;
        const target = actionsMap.get(actionType).target;

        // Éviter une division par zéro en vérifiant que target est défini et non nul
        if (target !== undefined && target !== 0) {
            const calculatedValue = progress / target;
            const actionData = actionsMap.get(actionType);
            if (actionData) {
                actionData.value = calculatedValue;
                actionData.progress = progress;
                actionsMap.set(actionType, actionData);
            } else {
                // Handle case where action doesn't exist (optional)
                console.warn(`Action type '${actionType}' not found in actionsMap.`);
            }
        } else {
            console.warn(`La cible (target) pour l'action ${actionType} n'est pas définie ou est nulle.`);
        }

        // Sauvegarder les statistiques mises à jour
        stats.actions = actionsMap;
        stats.markModified('actions');
        await stats.save();

        console.log(`Statistiques globales mises à jour pour ${actionType} avec la valeur ${value}.`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques globales :', error.message);
    }
};

exports.getUserContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find({ user: req.user.id }).populate('event', 'title');
        res.status(200).json(contributions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

exports.getAllContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find().populate('event', 'title').populate('user', 'name');
        res.status(200).json(contributions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

exports.getContributionsByEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const contributions = await Contribution.find({ event: eventId }).populate('user', 'name');
        if (contributions.length === 0) {
            return res.status(404).json({ message: 'No contributions found for this event.' });
        }
        res.status(200).json(contributions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.getContributionsByActionTypeAndMonth = async (req, res) => {
    const { actionType } = req.params;

    try {
        // Aggregate contributions by month and sum their values for all years
        const contributions = await Contribution.aggregate([
            { $match: { actionType: actionType } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" }
                    },
                    totalValue: { $sum: "$value" }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);

        if (contributions.length === 0) {
            return res.status(404).json({ message: 'No contributions found for this action type.' });
        }

        res.status(200).json([...contributions, { actionType }]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};