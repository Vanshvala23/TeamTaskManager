const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/Database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role
    } = req.body;

    const db = getDb();

    const existingUser = db.prepare(`
      SELECT id
      FROM users
      WHERE email = ?
    `).get(email);

    if (existingUser) {

      return res.status(409).json({
        error: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (
        name,
        email,
        password,
        role
      )
      VALUES (?, ?, ?, ?)
    `).run(
      name,
      email,
      hashedPassword,
      role || 'Member'
    );

    res.status(201).json({
      message: 'Signup successful'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Signup failed'
    });
  }
});
// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({

  token,

  user: {

    id: user.id,

    name: user.name,

    email: user.email,

    role: user.role
  }
});
});

// GET /api/auth/me
router.get(
  '/me',
  require('../middleware/authMiddleware').authenticate,
  (req, res) => {

    const db = getDb();

    const user = db.prepare(`
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE id = ?
    `).get(req.user.id);

    res.json({ user });
  }
);

module.exports = router;