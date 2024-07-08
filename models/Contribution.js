const { Schema, model } = require('mongoose');

const contributionSchema = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    actionType: {
        type: String,
        required: true
    }
});

module.exports = model('Contribution', contributionSchema);
