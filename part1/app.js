var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


(async () => {
    try {
        const dbConnection  =   await mysql.createConnection({
            host: 'localhost',
            user:'root',
            password:'',
            database:'DogWalkService'
        })

        const userCount     =   await dbConnection.execute('SELECT COUNT(*) AS COUNT FROM Users');
        if (userCount[0].count === 0) {
            await db.execute(`
                INSERT INTO Users (username, email, password_hash, role)
                VALUES
                ('alice123', 'alice@example.com', 'hashed123', 'owner'),
                ('carol123', 'carol@example.com', 'hashed456', 'owner')
                `);
        }

        const dogsCount     =   await dbConnection.execute('SELECT COUNT(*) AS COUNT FROM Dogs');
        if (dogsCount[0].count === 0) {
             await db.execute(`
                INSERT INTO Dogs (owner_id, name, size)
                VALUES
                ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
                ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small')
            `);
        }
    }
})


module.exports = app;
