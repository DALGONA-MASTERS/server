const { Schema, model } = require('mongoose');

const contributionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['trees_planted', 'waste_recycled', 'other_action']
    },
    value: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = model('Contribution', contributionSchema);
