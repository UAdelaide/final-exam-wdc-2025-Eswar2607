const express = require('express');
const path = require('path');
require('dotenv').config();
var mysql = require('mysql2/promise');
const session = require('express-session');
const app = express();


let dbConnection = require('./models/db');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({

    secret:'UserSession',
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);



// Export the app instead of listening here

// app.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const [rows] = await dbConnection.execute(
//             'SELECT * FROM Users WHERE username = ? AND password_hash = ?', [username, password]);

//         if (rows.length === 1) {
//             const user = rows[0];

//             req.session.user = {
//                 id: user.user_id,
//                 username: user.username,
//                 role: user.role
//             };

//             if (user.role === 'owner') {
//                 res.redirect('/owner-dashboard.html');
//             } else if (user.role === 'walker') {
//                 res.redirect('/walker-dashboard.html');
//             } else {
//                 res.status(403).send('Role not supported for login');
//             }
//         } else {
//             res.status(401).send('Invalid username or password');
//         }
//     } catch (error) {
//         console.error('Login Error:', error);
//         res.status(500).send('An error occurred during the login process.');
//     }
// });


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({message:'Could not log out please try again'});
        }
        res.clearCookie('connect.sid');
        res.status(200).json({message:'log out successsful'});
    });
});

module.exports = app;