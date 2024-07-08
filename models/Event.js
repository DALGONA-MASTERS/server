const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    actionType: {
        type: String,
        required: true,
        enum: ['trees_plantation', 'waste_recycling', 'beach_cleaning', 'other']
    },
    target: {
        type: Number,
        required: true
    },
    progress: {
        type: Number,
        default: 0
    }
});

module.exports = model('Event', eventSchema);
