var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { json } = require('stream/consumers');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

let dbConnection;


(async () => {
    try {
         dbConnection = await mysql.createConnection({
            host: 'localhost',
            user:'root',
            password:'',
            database:'DogWalkService'
        });

        const userCount = await dbConnection.execute('SELECT COUNT(*) AS COUNT FROM Users');
        if (userCount[0].count === 0) {
            await db.execute(`
                INSERT INTO Users (username, email, password_hash, role)
                VALUES
                ('alice123', 'alice@example.com', 'hashed123', 'owner'),
                ('carol123', 'carol@example.com', 'hashed456', 'owner')
                `);
        }

        const dogsCount = await dbConnection.execute('SELECT COUNT(*) AS COUNT FROM Dogs');
        if (dogsCount[0].count === 0) {
             await db.execute(`
                INSERT INTO Dogs (owner_id, name, size)
                VALUES
                ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
                ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small')
            `);
        }

        console.log('Data insereted to tables successfully');
    }
    catch (err) {
        console.log('Error setting up the data ', err);
    }
})();


app.get('/api/dogs', async (req, res) => {
    try {
        const [dogRows] = await dbConnection.execute(
            `SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
            FROM Dogs
            JOIN Users ON Dogs.owner_id = Users.user_id`);
            res.json(dogRows);
    } catch (error) {
        console.log('Error fetching the dogs data',error);
    }
});

app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const [rows] = await dbConnection.execute(
            `SELECT
            WalkRequests.request_id,
            Dogs.name AS dog_name,
            WalkRequests.requested_time,
            WalkRequests.duration_minutes,
            WalkRequests.location,
            Users.username AS owner_username
            FROM WalkRequests
            JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
            JOIN Users ON Dogs.owner_id = Users.user_id
            WHERE WalkRequests.status = 'open'
            ORDER BY WalkRequests.requested_time ASC`
            );
            res.json(rows);
    } catch (error) {
        console.log('Error fetching the walkRequests data',error);
    }
});

app.get('/api/walkers/summary', async (req, res) => {

});


module.exports = app;
