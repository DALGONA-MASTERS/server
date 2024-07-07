const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');

// Load models
const User = require('./models/User');
const Event = require('./models/Events');
const Contribution = require('./models/Contribution');
const Feed = require('./models/Post');
const Stats = require('./models/Stats');

// Connect to the database
connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Event.deleteMany();
        await Contribution.deleteMany();
        await Feed.deleteMany();
        await Stats.deleteMany();

        // Create users
        const user1 = new User({
            email: 'user1@example.com',
            password: 'password1', 
            fullName: 'User One',
            username: '9edour'
        });
        await user1.save();

        const user2 = new User({
            email: 'user2@example.com',
            password: 'password2', 
            fullName: 'User Two',
            username: '9edour2'
        });
        await user2.save();

        // Create events
        const event1 = new Event({
            title: 'Beach Cleanup',
            date: new Date(),
            description: 'Join us for a beach cleanup event.',
            createdBy: user1._id,
            participants: [user1._id, user2._id]
        });
        await event1.save();

        // Create contributions
        const contribution1 = new Contribution({
            user: user1._id,
            action: 'trees_planted',
            value: 10,
            description: 'Planted 10 trees in the park.'
        });
        await contribution1.save();

        const contribution2 = new Contribution({
            user: user2._id,
            action: 'waste_recycled',
            value: 5,
            description: 'Collected 5 kg of trash on the beach.'
        });
        await contribution2.save();

        // Create feed posts
        const post1 = new Feed({
            author: user2._id,
            content: 'Use reusable bags instead of plastic ones.',
        });
        await post1.save();

        const post2 = new Feed({
            author: user1._id,
            content: 'Separate your recyclables from your regular trash.',
            user: user2._id
        });
        await post2.save();

        // Create stats
        const stats = new Stats({
            nbUsers: 2,
            nbPosts: 2,
            nbEvents: 1,
            totalTreesPlanted: 10,
            totalTrashCollected: 5
        });
        await stats.save();

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
