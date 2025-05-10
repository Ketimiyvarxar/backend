const pool = require('../config/db');

exports.createTopic = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: 'Topic name is required' });

    const { rows } = await pool.query(
        `INSERT INTO topics (name) VALUES ($1) RETURNING id, name`,
        [name]
    );
    res.status(201).json({ topic: rows[0] });
};

exports.createQuiz = async (req, res) => {
    const topicId = parseInt(req.params.topicId, 10);
    const { name, questions } = req.body;
    if (!name || !Array.isArray(questions) || !questions.length) {
        return res.status(400).json({ msg: 'Quiz name and questions are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1) Insert quiz
        const { rows: quizRows } = await client.query(
            `INSERT INTO quizzes (topic_id, name) VALUES ($1, $2) RETURNING id`,
            [topicId, name]
        );
        const quizId = quizRows[0].id;

        // 2) Insert each question + its answers
        for (let i = 0; i < questions.length; i++) {
            const { text, answers: ansArr } = questions[i];
            if (!text || !Array.isArray(ansArr) || !ansArr.length) {
                throw new Error(`Question ${i+1} requires text and at least one answer`);
            }
            const { rows: qRows } = await client.query(
                `INSERT INTO questions (quiz_id, text, position)
         VALUES ($1, $2, $3) RETURNING id`,
                [quizId, text, i + 1]
            );
            const questionId = qRows[0].id;

            for (const a of ansArr) {
                if (!a.text || typeof a.isCorrect !== 'boolean') {
                    throw new Error(`Answers must include text & isCorrect boolean`);
                }
                await client.query(
                    `INSERT INTO answers (question_id, text, is_correct)
           VALUES ($1, $2, $3)`,
                    [questionId, a.text, a.isCorrect]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ quiz: { id: quizId, topicId, name } });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ msg: 'Failed to create quiz', error: err.message });
    } finally {
        client.release();
    }
};
