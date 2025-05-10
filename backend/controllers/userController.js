const jwt = require('jsonwebtoken');
const {getUserByEmail} = require("../models/user");

exports.whoami = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({msg: 'Unauthorized'});
    }
    const user = await getUserByEmail(req.user.email);
    if (!user) {
        return res.status(401).json({msg: 'Unauthorized'});
    }
    res.json({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.user_name,
        email: user.email,
        createdAt: user.created_at
    });
}