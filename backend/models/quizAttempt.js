// models/quizAttempt.js
const pool = require('../config/db');

async function createAttempt(userId, quizId) {
    const { rows } = await pool.query(
        `INSERT INTO quiz_attempts (user_id, quiz_id)
     VALUES ($1, $2)
     RETURNING id, taken_at`,
        [userId, quizId]
    );
    return rows[0];
}

async function recordAnswersBatch(attemptId, answers) {
    if (!Array.isArray(answers) || answers.length === 0) return;

    const values = [];
    const placeholders = answers
        .map((ans, i) => {
            const base = i * 4;
            // push in order: attempt_id, question_id, answer_id, is_correct
            values.push(attemptId, ans.questionId, ans.answerId, ans.isCorrect);
            // generate ($1, $2, $3, $4), ($5, $6, $7, $8), …
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
        })
        .join(', ');

    const sql = `
        INSERT INTO quiz_attempt_answers
            (attempt_id, question_id, answer_id, is_correct)
        VALUES
        ${placeholders};
    `;

    await pool.query(sql, values);
}

async function getAttemptsSummary(userId, quizId) {
    const { rows } = await pool.query(
        `SELECT
       qa.id          AS attempt_id,
       qa.taken_at,
       COUNT(aa.*)    AS total_questions,
       SUM((aa.is_correct)::int) AS correct_count
     FROM quiz_attempts qa
     JOIN quiz_attempt_answers aa ON aa.attempt_id = qa.id
     WHERE qa.user_id = $1 AND qa.quiz_id = $2
     GROUP BY qa.id, qa.taken_at
     ORDER BY qa.taken_at DESC`,
        [userId, quizId]
    );
    return rows;
}

async function getAttemptDetails(attemptId) {
    const { rows } = await pool.query(
        `SELECT question_id,
                answer_id,
                is_correct
         FROM quiz_attempt_answers
         WHERE attempt_id = $1
         ORDER BY id`,
        [attemptId]
    );
    return rows;
}

async function getAttemptById(attemptId) {
    const { rows } = await pool.query(
        `SELECT id, user_id, quiz_id, taken_at
       FROM quiz_attempts
      WHERE id = $1`,
        [attemptId]
    );
    return rows[0];
}


module.exports = {
    createAttempt,
    recordAnswersBatch,
    getAttemptsSummary,
    getAttemptDetails,
    getAttemptById
};
