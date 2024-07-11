const Stats = require('../models/Stats');
const Event = require('../models/Event');
const User = require('../models/User');
const Post = require('../models/Post');
const mongoose = require('mongoose');

exports.updateStats = async (req, res) => {
    try {
        let stats = await Stats.findOne();

        if (!stats) {
            console.log('Aucune statistique trouvée, création de nouvelles statistiques.');
            stats = new Stats();
        }

        // Compter les utilisateurs et les publications
        stats.nbUsers = await User.countDocuments();
        stats.nbPosts = await Post.countDocuments();

        // Compter les événements publics
        stats.nbEvents = await Event.countDocuments({ privacy: 'public' });

        // Initialiser stats.actions comme une nouvelle Map si elle est undefined
        if (!stats.actions || !(stats.actions instanceof Map)) {
            stats.actions = new Map();
        }

        // Si nbEvents est zéro, réinitialiser toutes les statistiques
        if (stats.nbEvents === 0) {
            stats.actions.clear(); 
        } else {
            const actions = await Event.aggregate([
                { $match: { privacy: 'public' } },
                { $group: { _id: '$actionType', 
                            totalProgress: { $sum: '$progress' }, 
                            totalTarget: { $sum: '$target' },
                            unit: { $first: '$unit' } } }
            ]).exec();

            actions.forEach(action => {
                const { _id, totalProgress, totalTarget, unit } = action;
                stats.actions.set(_id, {
                    value: totalProgress / (totalTarget || 1), 
                    unit: unit || '',
                    progress: totalProgress,
                    target: totalTarget
                });
            });
        }

        await stats.save();
        console.log('Statistiques mises à jour avec succès.');
        
        res.status(200).json(stats);  // Renvoie les statistiques mises à jour
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error.message);
        if (error instanceof mongoose.Error.ValidationError) {
            console.error('Erreur de validation:', error.errors);
            res.status(400).json({ message: 'Erreur de validation', errors: error.errors });
        } else if (error instanceof mongoose.Error.CastError) {
            console.error('Erreur de type de données:', error.message);
            res.status(400).json({ message: 'Erreur de type de données', error: error.message });
        } else {
            console.error('Erreur inconnue:', error);
            res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
    }
};

// Fonction pour obtenir les statistiques
exports.getStats = async (req, res) => {
    try {
        const stats = await Stats.findOne();
        if (!stats) {
            return res.status(404).json({ message: 'Statistiques introuvables.' });
        }
        res.status(200).json(stats);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur Serveur');
    }
};
