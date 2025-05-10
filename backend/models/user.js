// models/user.js
const pool = require('../config/db');

async function createUser({firstName, lastName, username, email, password}) {
    const result = await pool.query(
        `INSERT INTO users
             (first_name, last_name, user_name, email, password)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name AS "firstName", last_name AS "lastName",
               user_name AS "username", email, created_at AS "createdAt"`,
        [firstName, lastName, username, email, password]
    );
    return result.rows[0];
}

async function getUserByEmail(email) {
    const {rows} = await pool.query(
        `SELECT *
         FROM users
         WHERE email = $1`, [email]
    );
    return rows[0];
}

async function getUserByUsername(username) {
    const {rows} = await pool.query(
        `SELECT *
         FROM users
         WHERE user_name = $1`, [username]
    );
    return rows[0];
}

module.exports = {createUser, getUserByEmail, getUserByUsername};
