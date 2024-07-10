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
    participantsNumber: {
        type: Number,
        default: 0,
    },
    actionType: {
        type: String,
        required: true,
        enum: ['trees_plantation', 'waste_recycling', 'beach_cleaning', 'other']
    },
    unit: {
        type: String,
        required: true
    },
    target: {
        type: Number,
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    privacy: {
        type: String,
        required: true,
        enum: ["public", "private"],
        default: "public",
    },
    blacklist: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }]
});

module.exports = model('Event', eventSchema);
