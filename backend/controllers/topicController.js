// controllers/topicController.js
const { getAllTopics } = require('../models/topic');

exports.getTopics = async (req, res) => {
    try {
        const topics = await getAllTopics();
        res.json({ topics });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};
