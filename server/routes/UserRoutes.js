const router = require('express').Router();
const { getDb } = require('../db/Database');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// GET /api/users/search?email=
router.get('/search', (req, res) => {
  const { email } = req.query;
  if (!email || email.length < 2)
    return res.status(400).json({ error: 'Provide at least 2 characters' });

  const db = getDb();
  const users = db.prepare(`
    SELECT id, name, email FROM users
    WHERE email LIKE ? AND id != ?
    LIMIT 5
  `).all(`%${email.toLowerCase()}%`, req.user.id);
  res.json({ users });
});

module.exports = router;