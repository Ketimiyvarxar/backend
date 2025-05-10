// server.js
require('dotenv').config();
const express = require('express');

const {swaggerUi, specs} = require('./config/swagger');


const authRoutes = require('./routes/authRouter');
const userRoutes = require('./routes/userRouter');
const topicRoutes = require('./routes/topicRoutes');
const adminRoutes = require('./routes/adminRouter');

const app = express();
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);

app.use('/api/topic', topicRoutes);

app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
