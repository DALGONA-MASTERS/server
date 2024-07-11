const { Schema, model } = require('mongoose');
const { boolean } = require('webidl-conversions');

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
    },
    validated:{
        type: Boolean,
        required: true,
        default: true
    },
    accumulatedProgress: {
        type: Number,
        default: 0
    }
});

contributionSchema.pre('validate', async function(next) {
    try {
        const event = await this.model('Event').findById(this.event);
        if (!event) {
            throw new Error('Événement associé non trouvé.');
        }
        this.actionType = event.actionType;
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = model('Contribution', contributionSchema);