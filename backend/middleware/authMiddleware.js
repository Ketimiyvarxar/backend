const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({msg: 'No token provided'});

    const token = header.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch {
        return res.status(403).json({msg: 'Invalid or expired token'});
    }
};
