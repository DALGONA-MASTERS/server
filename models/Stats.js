const { Schema, model } = require('mongoose');

const StatsSchema = new Schema({
    nbUsers: {
        type: Number,
        default: 0
    },
    nbPosts: {
        type: Number,
        default: 0
    },
    nbEvents: {
        type: Number,
        default: 0
    },
    totalTreesPlanted: {
        type: Number,
        default: 0
    },
    totalTrashCollected: {
        type: Number,
        default: 0 // Quantity in kilograms
    },
    totalOtherContributions: {
        type: Number,
        default: 0
    }
});

module.exports = model('Stats', StatsSchema);
