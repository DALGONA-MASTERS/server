const { Schema, model } = require('mongoose');

const statsSchema = new Schema({
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
    actions: {
        type: Map,
        of: Number,
        default: {}
    }
});

module.exports = model('Stats', statsSchema);
