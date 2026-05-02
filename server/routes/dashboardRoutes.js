const router = require('express').Router();

const { getDb } = require('../db/Database');

const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// =========================
// DASHBOARD STATS
// =========================

router.get('/stats', (req, res) => {

  try {

    const db = getDb();

    // Get all project IDs user belongs to

    const projects = db.prepare(`
      SELECT project_id
      FROM project_members
      WHERE user_id = ?
    `).all(req.user.id);

    const projectIds = projects.map(
      (p) => p.project_id
    );

    // No projects

    if (projectIds.length === 0) {

      return res.json({
        total: 0,
        todo: 0,
        inprogress: 0,
        done: 0,
        overdue: 0,
        recentTasks: []
      });
    }

    const placeholders = projectIds
      .map(() => '?')
      .join(',');

    // TOTAL

    const total = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE project_id IN (${placeholders})
    `).get(...projectIds);

    // TODO

    const todo = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE status = 'todo'
      AND project_id IN (${placeholders})
    `).get(...projectIds);

    // IN PROGRESS

    const inprogress = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE status = 'inprogress'
      AND project_id IN (${placeholders})
    `).get(...projectIds);

    // DONE

    const done = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE status = 'done'
      AND project_id IN (${placeholders})
    `).get(...projectIds);

    // OVERDUE

    const overdue = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE due_date < date('now')
      AND status != 'done'
      AND project_id IN (${placeholders})
    `).get(...projectIds);

    // RECENT TASKS

    const recentTasks = db.prepare(`
      SELECT *
      FROM tasks
      WHERE project_id IN (${placeholders})
      ORDER BY created_at DESC
      LIMIT 5
    `).all(...projectIds);

    res.json({
      total: total.count,
      todo: todo.count,
      inprogress: inprogress.count,
      done: done.count,
      overdue: overdue.count,
      recentTasks
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Failed to fetch dashboard stats'
    });
  }
});

module.exports = router;