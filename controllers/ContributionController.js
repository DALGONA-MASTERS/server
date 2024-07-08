const Event = require('../models/Event');
const Contribution = require('../models/Contribution');

exports.addContribution = async (req, res) => {
    const { eventId, value } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        const existingContribution = await Contribution.findOne({ event: eventId, user: req.user.id });
        
        if (existingContribution) {
            existingContribution.value = value;
            existingContribution.actionType = event.actionType; // Update actionType if needed
            await existingContribution.save();
            res.json(existingContribution);
        } else {
            const newContribution = new Contribution({
                event: eventId,
                user: req.user.id,
                value,
                actionType: event.actionType // Include actionType in the new contribution
            });

            await newContribution.save();
            res.json(newContribution);
        }

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


exports.getUserContributions = async (req, res) => {
    try {
        const contributions = await Contribution.find({ user: req.user.id }).populate('event', 'title');
        res.json(contributions);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};
