const {createTopic, getTopicById} = require("../models/topic");
const {createQuiz} = require("../models/quiz");

exports.createTopic = async (req, res) => {

    try {
        const {name} = req.body;
        if (!name) return res.status(400).json({msg: 'Topic name is required'});

        if (name.length < 3 || name.length > 50) {
            return res.status(400).json({msg: 'Topic name must be between 3 and 50 characters'});
        }

        const topic = await createTopic(name);

        res.status(201).json({topic});
    } catch (err) {
        console.error(err);
        res.status(500).json({msg: 'Failed to create topic', error: err.message});
    }

};

exports.createQuiz = async (req, res) => {
    try {
        const topicId = parseInt(req.params.topicId, 10);
        const {name, questions} = req.body;

        const topic = await getTopicById(topicId);

        if (!name || typeof name !== 'string') {
            return res.status(400).json({msg: 'Quiz name is required and must be a string'});
        }
        if (name.length < 3 || name.length > 100) {
            return res.status(400).json({msg: 'Quiz name must be between 3 and 100 characters'});
        }

        if (!Array.isArray(questions) || questions.length < 1) {
            return res.status(400).json({msg: 'You must supply at least one question'});
        }
        if (questions.length > 50) {
            return res.status(400).json({msg: 'No more than 50 questions allowed per quiz'});
        }

        // 4) Per-question & per-answer validation…
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text || typeof q.text !== 'string') {
                return res.status(400).json({msg: `Question ${i + 1}: text is required and must be a string`});
            }
            if (q.text.length < 5 || q.text.length > 255) {
                return res.status(400).json({msg: `Question ${i + 1}: text must be 5–255 characters`});
            }
            if (!Array.isArray(q.answers) || q.answers.length < 2) {
                return res.status(400).json({msg: `Question ${i + 1}: you need at least 2 answers`});
            }
            if (q.answers.length > 10) {
                return res.status(400).json({msg: `Question ${i + 1}: no more than 10 answers allowed`});
            }

            let correctCount = 0;
            for (let j = 0; j < q.answers.length; j++) {
                const a = q.answers[j];
                if (!a.text || typeof a.text !== 'string') {
                    return res.status(400).json({msg: `Question ${i + 1}, Answer ${j + 1}: text is required`});
                }
                if (a.text.length < 1 || a.text.length > 100) {
                    return res.status(400).json({msg: `Question ${i + 1}, Answer ${j + 1}: text must be 1–100 chars`});
                }
                if (typeof a.isCorrect !== 'boolean') {
                    return res.status(400).json({msg: `Question ${i + 1}, Answer ${j + 1}: isCorrect must be true/false`});
                }
                if (a.isCorrect) correctCount++;
            }

            if (correctCount !== 1) {
                return res.status(400).json({msg: `Question ${i + 1}: exactly one answer must have isCorrect=true`});
            }
        }
        const quiz = await createQuiz(topicId, name, questions);
        return res.status(201).json({quiz});

    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: 'Failed to create quiz', error: err.message});
    }
};
