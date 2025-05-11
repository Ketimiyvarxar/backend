// controllers/topicController.js
const { getAllTopics, isCompleted, getAverageScore } = require('../models/topic');

exports.getTopics = async (req, res) => {
    const user = req.user;
    console.log(user)
    try {
        const topics = await getAllTopics();
        if(user){
            const userId = user.id;
            for (const topic of topics) {
                console.log(topic)
                const topicId = topic.id;
                topic.isCompleted = await isCompleted(userId, topicId);
                topic.averageScore = await getAverageScore(userId, topicId);
            }
        }
        res.json({ topics });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};