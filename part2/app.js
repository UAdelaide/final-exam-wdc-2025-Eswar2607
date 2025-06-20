const express = require('express');
const path = require('path');
require('dotenv').config();
var mysql = require('mysql2/promise');
const session = require('express-session');
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



// Export the app instead of listening here

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await dbConnection.execute(
            'SELECT * FROM Users WHERE username = ? AND password_hash = ?', [username, password]);

        if (rows.length === 1) {
            const user = rows[0];


module.exports = app;