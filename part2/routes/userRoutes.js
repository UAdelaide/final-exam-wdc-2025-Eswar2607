const express = require('express');
const router = express.Router();
const db = require('../models/db');
const app = require('../app');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

router.get('/dogs', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'owner') {
        return res.status(401).json({ error: 'Not authorized or not logged in' });
    }

    try {
      const ownerId = req.session.user.id;
      const [dogs] = await db.query('SELECT dog_id, name FROM Dogs WHERE owner_id = ?', [ownerId]);
      res.json(dogs);
    } catch (error) {
        console.error('SQL Error:', error);
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});

// POST login (dummy version)
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [rows] = await db.query(`
//       SELECT user_id, username, role FROM Users
//       WHERE email = ? AND password_hash = ?
//     `, [email, password]);

//     if (rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     res.json({ message: 'Login successful', user: rows[0] });
//   } catch (error) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// });

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.execute(
            'SELECT * FROM Users WHERE username = ? AND password_hash = ?', [username, password]);

        if (rows.length === 1) {
            const user = rows[0];

            req.session.user = {
                id: user.user_id,
                username: user.username,
                role: user.role
            };

            if (user.role === 'owner') {
                res.redirect('/owner-dashboard.html');
            } else if (user.role === 'walker') {
                res.redirect('/walker-dashboard.html');
            } else {
                res.status(403).send('Role not supported for login');
            }
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('An error occurred during the login process.');
    }
});


module.exports = router;