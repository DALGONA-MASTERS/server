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
        res.status(201).json(newContribution);

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

        res.json(contribution);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};
/*
exports.deleteContribution = async (req, res) => {
    const { contributionId } = req.params;

    try {
        let contribution = await Contribution.findById(contributionId);
        if (!contribution) {
            return res.status(404).json({ message: 'Contribution non trouvée.' });
        }

        if (contribution.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette contribution." });
        }

        await contribution.remove();
        res.json({ message: 'Contribution supprimée avec succès.' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};*/


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
        
        res.json(contribution);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

const updateGlobalStats = async (actionType, value) => {
    try {
        let stats = await Stats.findOneAndUpdate(
            {},
            {
                $inc: { [`actions.${actionType}.progress`]: value },
                $currentDate: { lastModified: true }
            },
            { upsert: true, new: true }
        );

        // Vérifie si l'actionType existe déjà dans stats.actions, sinon l'initialise
        if (!stats.actions[actionType]) {
            stats.actions[actionType] = { progress: value };
        }
        console.log(stats)
        const progress = stats.actions[actionType].progress;
        const target = stats.actions[actionType].target;

        // Éviter une division par zéro en vérifiant que target est défini et non nul
        if (target !== undefined && target !== 0) {
            const calculatedValue = progress / target;
            stats.actions[actionType].value = calculatedValue;
        } else {
            console.warn(`La cible (target) pour l'action ${actionType} n'est pas définie ou est nulle.`);
        }

        await stats.save();

        console.log(`Statistiques globales mises à jour pour ${actionType} avec la valeur ${value}.`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques globales :', error.message);
    }
};

exports.getUserContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find({ user: req.user.id }).populate('event', 'title');
        res.json(contributions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};

exports.getAllContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find().populate('event', 'title').populate('user', 'name');
        res.json(contributions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};