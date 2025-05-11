const jwt = require('jsonwebtoken');

module.exports = function notRequiredAuthMiddleware(req, res, next) {
    const header = req.headers.authorization;
    console.log("Header: ", header);
    if (!header?.startsWith('Bearer '))
        return next()

    const token = header.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(req.user);
        return next();
    } catch {
        console.log('Invalid token');
        return next();
    }
};
