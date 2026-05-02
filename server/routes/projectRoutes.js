const router = require('express').Router();

const { getDb } = require('../db/Database');

const {
  authenticate,
  requireProjectRole
} = require('../middleware/authMiddleware');

router.use(authenticate);



// GET ALL PROJECTS

router.get('/', (req, res) => {

  try {

    const db = getDb();

    const projects = db.prepare(`
      SELECT
        p.*,
        pm.role,
        u.name as creator_name,

        (
          SELECT COUNT(*)
          FROM project_members
          WHERE project_id = p.id
        ) as member_count,

        (
          SELECT COUNT(*)
          FROM tasks
          WHERE project_id = p.id
        ) as task_count

      FROM projects p

      JOIN project_members pm
        ON pm.project_id = p.id

      JOIN users u
        ON u.id = p.created_by

      WHERE pm.user_id = ?

      ORDER BY p.created_at DESC
    `).all(req.user.id);

    res.json({ projects });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Failed to fetch projects'
    });
  }
});



// CREATE PROJECT

router.post('/', (req, res) => {

  try {

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Project name required'
      });
    }

    const db = getDb();

    const result = db.prepare(`
      INSERT INTO projects (
        name,
        description,
        created_by
      )
      VALUES (?, ?, ?)
    `).run(
      name.trim(),
      description || null,
      req.user.id
    );

    db.prepare(`
      INSERT INTO project_members (
        project_id,
        user_id,
        role
      )
      VALUES (?, ?, ?)
    `).run(
      result.lastInsertRowid,
      req.user.id,
      'admin'
    );

    const project = db.prepare(`
      SELECT *
      FROM projects
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      project: {
        ...project,
        role: 'admin'
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Failed to create project'
    });
  }
});



// GET SINGLE PROJECT

router.get(
  '/:projectId',
  requireProjectRole('admin', 'member'),

  (req, res) => {

    try {

      const db = getDb();

      const project = db.prepare(`
        SELECT
          p.*,
          pm.role,
          u.name as creator_name

        FROM projects p

        JOIN project_members pm
          ON pm.project_id = p.id

        JOIN users u
          ON u.id = p.created_by

        WHERE p.id = ?
        AND pm.user_id = ?
      `).get(
        req.params.projectId,
        req.user.id
      );

      const members = db.prepare(`
        SELECT
          u.id,
          u.name,
          u.email,
          pm.role,
          pm.joined_at

        FROM users u

        JOIN project_members pm
          ON pm.user_id = u.id

        WHERE pm.project_id = ?

        ORDER BY pm.role DESC
      `).all(req.params.projectId);

      res.json({
        project,
        members
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: 'Failed to fetch project'
      });
    }
  }
);

router.put(
  '/:projectId',
  requireProjectRole('admin'),

  (req, res) => {

    try {

      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          error: 'Project name required'
        });
      }

      const db = getDb();

      db.prepare(`
        UPDATE projects
        SET
          name = ?,
          description = ?
        WHERE id = ?
      `).run(
        name.trim(),
        description || null,
        req.params.projectId
      );

      const updatedProject = db.prepare(`
        SELECT *
        FROM projects
        WHERE id = ?
      `).get(req.params.projectId);

      res.json({
        project: updatedProject
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: 'Failed to update project'
      });
    }
  }
);

router.delete(
  '/:projectId',
  requireProjectRole('admin'),

  (req, res) => {

    try {

      const db = getDb();

      db.prepare(`
        DELETE FROM projects
        WHERE id = ?
      `).run(req.params.projectId);

      res.json({
        message: 'Project deleted'
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: 'Failed to delete project'
      });
    }
  }
);
router.post(
  '/:projectId/members',
  requireProjectRole('admin'),

  (req, res) => {

    try {

      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email required'
        });
      }

      const db = getDb();

      const user = db.prepare(`
        SELECT id, name, email
        FROM users
        WHERE email = ?
      `).get(email.toLowerCase().trim());

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      const existing = db.prepare(`
        SELECT id
        FROM project_members
        WHERE project_id = ?
        AND user_id = ?
      `).get(
        req.params.projectId,
        user.id
      );

      if (existing) {
        return res.status(409).json({
          error: 'User already member'
        });
      }

      db.prepare(`
        INSERT INTO project_members (
          project_id,
          user_id,
          role
        )
        VALUES (?, ?, ?)
      `).run(
        req.params.projectId,
        user.id,
        role === 'admin'
          ? 'admin'
          : 'member'
      );

      res.status(201).json({
        user: {
          ...user,
          role: role || 'member'
        }
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: 'Failed to add member'
      });
    }
  }
);



router.delete(
  '/:projectId/members/:userId',
  requireProjectRole('admin'),

  (req, res) => {

    try {

      if (
        Number(req.params.userId) === req.user.id
      ) {
        return res.status(400).json({
          error: 'Cannot remove yourself'
        });
      }

      const db = getDb();

      db.prepare(`
        DELETE FROM project_members
        WHERE project_id = ?
        AND user_id = ?
      `).run(
        req.params.projectId,
        req.params.userId
      );

      res.json({
        message: 'Member removed'
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: 'Failed to remove member'
      });
    }
  }
);



router.put(
  '/:projectId/members/:userId/role',
  requireProjectRole('admin'),

  (req, res) => {

    try {

      const { role } = req.body;

      if (
        !['admin', 'member'].includes(role)
      ) {
        return res.status(400).json({
          error: 'Invalid role'
        });
      }

      const db = getDb();

      db.prepare(`
        UPDATE project_members
        SET role = ?
        WHERE project_id = ?
        AND user_id = ?
      `).run(
        role,
        req.params.projectId,
        req.params.userId
      );

      res.json({
        message: 'Role updated'
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: 'Failed to update role'
      });
    }
  }
);

module.exports = router;