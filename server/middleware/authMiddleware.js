const jwt = require('jsonwebtoken');
const { getDb } = require('../db/Database');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const db = getDb();

    const user = db.prepare(`
      SELECT id, name, email
      FROM users
      WHERE id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    req.user = user;

    next();

  } catch (error) {

    return res.status(401).json({
      error: 'Invalid token'
    });
  }
}

function requireProjectRole(...roles) {

  return (req, res, next) => {

    try {

      const db = getDb();

      const projectId =
        req.params.projectId ||
        req.body.project_id;

      if (!projectId) {
        return res.status(400).json({
          error: 'Project ID required'
        });
      }

      const member = db.prepare(`
        SELECT role
        FROM project_members
        WHERE project_id = ?
        AND user_id = ?
      `).get(projectId, req.user.id);

      if (!member) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      req.memberRole = member.role;

      next();

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        error: 'Authorization failed'
      });
    }
  };
}

module.exports = {
  authenticate,
  requireProjectRole,
  JWT_SECRET
};