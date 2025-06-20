const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();


let dbConnection;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);


(async )

// Export the app instead of listening here

app.post('/login', async (req, res) => {
    const {username, password } = req.body;

    const [rows] = await
});


module.exports = app;