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

        const walkReqCount = await dbConnection.execute('SELECT COUNT(*) AS COUNT FROM WalkRequests');
        if (walkReqCount[0][0].COUNT === 0) {
            await dbConnection.execute(`
                INSERT INTO WalkRequests (request_id, walker_id, dog_id, requested_time, duration_minutes, location, status)
                VALUES
                (1, (SELECT user_id FROM Users WHERE username = 'bobwalker'), (SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-20 10:00:00', 30, 'Park', 'completed'),
                (2, (SELECT user_id FROM Users WHERE username = 'bobwalker'), (SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-21 10:00:00', 45, 'Park', 'completed'),
                (3, (SELECT user_id FROM Users WHERE username = 'david_w'), (SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-20 09:00:00', 30, 'Park', 'completed')
            `);
        }


        const ratingCount = await dbConnection.execute('SELECT COUNT(*) AS COUNT FROM WalkRatings');
        if (ratingCount[0][0].COUNT === 0) {
            await dbConnection.execute(`
                INSERT INTO WalkRatings (walker_id, rating, request_id)
                VALUES
                ((SELECT user_id FROM Users WHERE username = 'bobwalker'), 4.5, 1),
                ((SELECT user_id FROM Users WHERE username = 'bobwalker'), 5.0, 2),
                ((SELECT user_id FROM Users WHERE username = 'david_w'), 3.0, 3)
            `);
        }
        console.log('Data inserted to tables successfully');
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
    try {
        const [summaryRow] = await dbConnection.execute(`
            SELECT u.username AS walker_username,
            COUNT(wr.rating_id) AS total_ratings,
            AVG(wr.rating) AS average_rating,
            COUNT(wr.rating_id) AS completed_walks
            FROM Users u
            LEFT JOIN WalkRatings wr ON wr.walker_id = u.user_id
            WHERE u.role = 'walker'
            GROUP BY u.user_id`
            );

            const result = summaryRow.map((row) => ({
                walker_username: row.walker_username,
                total_ratings: Number(row.total_ratings),
                average_rating: row.average_rating !== null ? Number(parseFloat(row.average_rating).toFixed(2)) : null,
                completed_walks: Number(row.completed_walks)
                }));

            res.json(result);
    } catch (error) {
        console.log('Error fetching the walkerSummary data',error);
    }
});


module.exports = app;
