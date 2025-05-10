const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    createUser,
    getUserByEmail,
    getUserByUsername
} = require('../models/user');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);

exports.register = async (req, res) => {
    try {
        const {firstName, lastName, username, email, password, repeatPassword} = req.body;
        if (!firstName || !lastName || !username || !email || !password || !repeatPassword) {
            return res.status(400).json({msg: 'All fields are required'});
        }

        if (firstName.length < 2 || firstName.length > 20) {
            return res.status(400).json({msg: 'First name must be between 2 and 20 characters'});
        }
        if (lastName.length < 2 || lastName.length > 20) {
            return res.status(400).json({msg: 'Last name must be between 2 and 20 characters'});
        }

        if (username.length < 2 || username.length > 20) {
            return res.status(400).json({msg: 'Username must be between 2 and 20 characters'});
        }

        if (password.length < 8) {
            return res.status(400).json({msg: 'Password must be more than 8 characters'});
        }

        if(password.search(/[A-Z]/) < 0) {
            return res.status(400).json({msg: 'Password must contain at least one uppercase letter'});
        }

        if(password.search(/[a-z]/) < 0) {
            return res.status(400).json({msg: 'Password must contain at least one lowercase letter'});
        }

        if(password.search(/[0-9]/) < 0) {
            return res.status(400).json({msg: 'Password must contain at least one number'});
        }

        if(password.search(/[^a-zA-Z0-9]/) < 0) {
            return res.status(400).json({msg: 'Password must contain at least one special character'});
        }


        if (password !== repeatPassword) {
            return res.status(400).json({msg: 'Passwords do not match'});
        }
        if (await getUserByEmail(email)) {
            return res.status(400).json({msg: 'Email already in use'});
        }
        if (await getUserByUsername(username)) {
            return res.status(400).json({msg: 'Username already in use'});
        }
        const hashed = await bcrypt.hash(password, saltRounds);
        const user = await createUser({firstName, lastName, username, email, password: hashed});
        return res.status(201).json({user});
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: 'Server error'});
    }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({msg: 'Email and password are required'});
        }

        const user = await getUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({msg: 'Invalid credentials'});
        }

        const token = jwt.sign(
            {id: user.id, email: user.email, userName: user.user_name},
            process.env.JWT_SECRET,
            {expiresIn: '10h'}
        );
        return res.json({token});
    } catch (err) {
        console.error(err);
        return res.status(500).json({msg: 'Server error'});
    }
};
