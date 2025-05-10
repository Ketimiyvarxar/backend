const pool = require('../config/db');

module.exports = async (req, res, next) => {
    const userId = req.user.id;
    const { rows } = await pool.query(
        `SELECT is_admin FROM users WHERE id = $1`,
        [userId]
    );
    if (!rows[0]?.is_admin) {
        return res.status(403).json({ msg: 'Admin access required' });
    }
    next();
};
