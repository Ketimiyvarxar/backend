// models/topic.js
const pool = require('../config/db');

async function getAllTopics() {
    const {rows} = await pool.query(
        `SELECT id, name
         FROM topics
         ORDER BY name`
    );
    return rows;
}

async function getTopicById(topicId) {
    const {rows} = await pool.query(
        `SELECT id, name
         FROM topics
         WHERE id = $1`,
        [topicId]
    );
    return rows[0];
}

async function createTopic(name) {
    if (!name) return null;

    const {rows} = await pool.query(
        `INSERT INTO topics (name)
         VALUES ($1)
         RETURNING id, name`,
        [name]
    );
    return rows[0];
}

async function isCompleted(userId, topicId) {
    // get all quiz ids for topic
    const quizIds = await pool.query(
        `SELECT id
         FROM quizzes
         WHERE topic_id = $1`,
        [topicId]
    );

    if (quizIds.rows.length === 0) return false;

    // get all distinct quiz attempts for user
    const attempts = await pool.query(
        `SELECT DISTINCT quiz_id
         FROM quiz_attempts
         WHERE user_id = $1`,
        [userId]
    );

    // check if all quizzes have been attempted
    const quizIdsSet = new Set(quizIds.rows.map(q => q.id));
    const attemptsSet = new Set(attempts.rows.map(a => a.quiz_id));
    return [...quizIdsSet].every(quizId => attemptsSet.has(quizId));
}

async function getAverageScore(userId, topicId) {
    // 1) grab all the quizzes for that topic
    const { rows: quizzes } = await pool.query(
        `SELECT id
     FROM quizzes
     WHERE topic_id = $1`,
        [topicId]
    );
    if (quizzes.length === 0) return 0;

    let sumQuizAverages = 0;
    for (const { id: quizId } of quizzes) {
        // 2) for each quiz, compute its average score across attempts
        const { rows } = await pool.query(
            `SELECT AVG(ratio) AS avg_ratio
             FROM (SELECT qa.id,
                          SUM(CASE WHEN aa.is_correct THEN 1 ELSE 0 END)::float
                              / COUNT(aa.*) AS ratio
                   FROM quiz_attempts qa
                            JOIN ketiqz.public.quiz_attempt_answers aa
                                 ON aa.attempt_id = qa.id
                   WHERE qa.user_id = $1
                     AND qa.quiz_id = $2
                   GROUP BY qa.id) t`,
            [userId, quizId]
        );
        const quizAvg = rows[0].avg_ratio ?? 0;
        sumQuizAverages += parseFloat(quizAvg);
    }

    // 3) average those quiz-level averages
    return sumQuizAverages / quizzes.length;
}


module.exports = {getAllTopics, createTopic, getTopicById, isCompleted, getAverageScore};
