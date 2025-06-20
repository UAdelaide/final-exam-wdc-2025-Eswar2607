const express = require('express');
const path = require('path');
require('dotenv').config();
var mysql = require('mysql2/promise');

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


(async () => {
    try {
        dbConnection = await mysql.createConnection({
            host: 'localhost',
            user:'root',
            password:'',
            database:'DogWalkService'
            });
    }
    catch (error)
    {
        console.log('Error setting up the database ', error);
    }
})();

// Export the app instead of listening here

app.post('/login', async (req, res) => {
    const {username, password } = req.body;
    const [rows] = await dbConnection.execute(
        'SELECT * FROM Users WHERE username = ? AND password_hash = ?', [username, password]);

        if (rows.length === 1) 
});




module.exports = app;