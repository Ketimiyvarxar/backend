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

module.exports = {getAllTopics};
