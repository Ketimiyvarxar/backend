// models/quiz.js
const pool = require('../config/db');

const GET_QUIZZES_BY_TOPIC_ID_SQL = `
    SELECT qz.id       AS quiz_id,
           qz.name     AS quiz_name,
           qs.id       AS question_id,
           qs.text     AS question_text,
           qs.position AS question_pos,
           ans.id      AS answer_id,
           ans.text    AS answer_text
    FROM quizzes qz
             JOIN questions qs ON qs.quiz_id = qz.id
             JOIN answers ans ON ans.question_id = qs.id
    WHERE qz.topic_id = $1
    ORDER BY qz.id, qs.position, ans.id
`;

const GET_QUIZZ_BY_ID_SQL = `
    SELECT qz.id          AS quiz_id,
           qz.name        AS quiz_name,
           qs.id          AS question_id,
           qs.text        AS question_text,
           qs.position    AS question_pos,
           ans.id         AS answer_id,
           ans.text       AS answer_text,
           ans.is_correct AS is_correct
    FROM quizzes qz
             JOIN questions qs ON qs.quiz_id = qz.id
             JOIN answers ans ON ans.question_id = qs.id
    WHERE qz.id = $1
    ORDER BY qz.id, qs.position, ans.id
`;

async function getQuizzesByTopicId(topicId) {
    const {rows} = await pool.query(GET_QUIZZES_BY_TOPIC_ID_SQL, [topicId]);
    if (rows.length === 0) return [];

    // group by quiz
    const quizzesMap = new Map();
    for (const r of rows) {
        if (!quizzesMap.has(r.quiz_id)) {
            quizzesMap.set(r.quiz_id, {
                quizId: r.quiz_id,
                quizName: r.quiz_name,
                questions: []
            });
        }
        const quiz = quizzesMap.get(r.quiz_id);

        // group by question
        let qObj = quiz.questions.find(q => q.id === r.question_id);
        if (!qObj) {
            qObj = {
                id: r.question_id,
                text: r.question_text,
                position: r.question_pos,
                answers: []
            };
            quiz.questions.push(qObj);
        }

        qObj.answers.push({
            id: r.answer_id,
            text: r.answer_text
        });
    }

    return Array.from(quizzesMap.values());
}

async function getQuizzById(quizId) {

    const {rows} = await pool.query(GET_QUIZZ_BY_ID_SQL, [quizId]);
    if (rows.length === 0) return [];

    // group by quiz
    const quizzesMap = new Map();
    for (const r of rows) {
        if (!quizzesMap.has(r.quiz_id)) {
            quizzesMap.set(r.quiz_id, {
                quizId: r.quiz_id,
                quizName: r.quiz_name,
                questions: []
            });
        }
        const quiz = quizzesMap.get(r.quiz_id);

        // group by question
        let qObj = quiz.questions.find(q => q.id === r.question_id);
        if (!qObj) {
            qObj = {
                id: r.question_id,
                text: r.question_text,
                position: r.question_pos,
                answers: []
            };
            quiz.questions.push(qObj);
        }

        qObj.answers.push({
            id: r.answer_id,
            text: r.answer_text,
            isCorrect: r.is_correct
        });
    }

    return Array.from(quizzesMap.values());
}

module.exports = {getQuizzesByTopicId, getQuizzById};
