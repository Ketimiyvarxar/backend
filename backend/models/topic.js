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

module.exports = {getAllTopics, createTopic, getTopicById};
