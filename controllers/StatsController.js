const Stats = require('../models/Stats');
const Event = require('../models/Event');

exports.updateStats = async () => {
    try {
        const stats = await Stats.findOne();

        stats.nbEvents = await Event.countDocuments();

        const actions = await Event.aggregate([
            { $group: { _id: '$actionType', totalProgress: { $sum: '$progress' }, totalTarget: { $sum: '$target' } } }
        ]).exec();

        actions.forEach(action => {
            const { _id, totalProgress, totalTarget } = action;
            if (totalTarget !== 0) {
                stats[_id] = totalProgress / totalTarget;
            } else {
                stats[_id] = 0;
            }
        });

        await stats.save();
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error.message);
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await Stats.findOne();
        if (!stats) {
            return res.status(404).json({ message: 'Statistiques introuvables.' });
        }
        res.json(stats);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};
