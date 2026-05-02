const router = require('express').Router();

const { getDb } = require('../db/Database');

const {
  authenticate,
  requireProjectRole
} = require('../middleware/authMiddleware');

router.use(authenticate);



// =========================
// DASHBOARD
// =========================

router.get('/dashboard', (req, res) => {

  try {

    const db = getDb();

    const tasks = db.prepare(`
      SELECT
        t.*,
        p.name as project_name,
        u.name as assignee_name,
        cu.name as creator_name

      FROM tasks t

      JOIN projects p
        ON p.id = t.project_id

      JOIN project_members pm
        ON pm.project_id = p.id

      LEFT JOIN users u
        ON u.id = t.assigned_to

      LEFT JOIN users cu
        ON cu.id = t.created_by

      WHERE pm.user_id = ?

      ORDER BY t.created_at DESC
    `).all(req.user.id);

    const stats = {

      total:
        tasks.length,

      todo:
        tasks.filter(
          t => t.status === 'todo'
        ).length,

      inprogress:
        tasks.filter(
          t => t.status === 'inprogress'
        ).length,

      done:
        tasks.filter(
          t => t.status === 'done'
        ).length,

      overdue: 0
    };

    res.json({

      total: stats.total,

      todo: stats.todo,

      inprogress: stats.inprogress,

      done: stats.done,

      overdue: stats.overdue,

      recentTasks: tasks.slice(0, 10)
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Dashboard failed'
    });
  }
});



// =========================
// GET PROJECT TASKS
// =========================

router.get(
  '/project/:projectId',
  requireProjectRole('admin', 'member'),

  (req, res) => {

    try {

      const db = getDb();

      let query = `
        SELECT
          t.*,
          u.name as assignee_name,
          cu.name as creator_name

        FROM tasks t

        LEFT JOIN users u
          ON u.id = t.assigned_to

        LEFT JOIN users cu
          ON cu.id = t.created_by

        WHERE t.project_id = ?
      `;

      const params = [req.params.projectId];

      if (req.query.status) {

        query += ` AND t.status = ?`;

        params.push(req.query.status);
      }

      if (req.query.priority) {

        query += ` AND t.priority = ?`;

        params.push(req.query.priority);
      }

      query += `
        ORDER BY
        CASE
          WHEN t.priority = 'urgent' THEN 1
          WHEN t.priority = 'high' THEN 2
          WHEN t.priority = 'medium' THEN 3
          ELSE 4
        END,
        t.created_at DESC
      `;

      const tasks = db.prepare(query).all(...params);

      res.json({ tasks });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: 'Failed to fetch tasks'
      });
    }
  }
);



// =========================
// CREATE TASK
// =========================

router.post(
  '/',
  requireProjectRole('admin'),

  (req, res) => {

    try {

      const {
        project_id,
        title,
        description,
        priority,
        due_date,
        assigned_to
      } = req.body;

      if (!title || !project_id) {

        return res.status(400).json({
          error: 'Project and title required'
        });
      }

      const db = getDb();

      const result = db.prepare(`
        INSERT INTO tasks (
          project_id,
          title,
          description,
          priority,
          due_date,
          assigned_to,
          created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(

        project_id,

        title.trim(),

        description || null,

        priority || 'medium',

        due_date || null,

        assigned_to || null,

        req.user.id
      );

      // IMPORTANT FIX

      const task = db.prepare(`
        SELECT
          t.*,
          u.name as assignee_name,
          cu.name as creator_name

        FROM tasks t

        LEFT JOIN users u
          ON u.id = t.assigned_to

        LEFT JOIN users cu
          ON cu.id = t.created_by

        WHERE t.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json({ task });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: 'Task creation failed'
      });
    }
  }
);



// =========================
// UPDATE TASK
// =========================

router.put('/:taskId', (req, res) => {

  try {

    const db = getDb();

    const task = db.prepare(`
      SELECT *
      FROM tasks
      WHERE id = ?
    `).get(req.params.taskId);

    if (!task) {

      return res.status(404).json({
        error: 'Task not found'
      });
    }

    const member = db.prepare(`
      SELECT role
      FROM project_members
      WHERE project_id = ?
      AND user_id = ?
    `).get(task.project_id, req.user.id);

    if (!member) {

      return res.status(403).json({
        error: 'Not a project member'
      });
    }

    const isAdmin =
      member.role === 'admin';

    const isAssignee =
      Number(task.assigned_to) === Number(req.user.id);

    if (!isAdmin && !isAssignee) {

      return res.status(403).json({
        error: 'No permission to edit task'
      });
    }

    const {
      title,
      description,
      priority,
      due_date,
      assigned_to,
      status
    } = req.body;

    if (!isAdmin) {

      db.prepare(`
        UPDATE tasks
        SET
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(

        status || task.status,

        req.params.taskId
      );

    } else {

      if (
        assigned_to !== undefined &&
        assigned_to !== null
      ) {

        const exists = db.prepare(`
          SELECT id
          FROM project_members
          WHERE project_id = ?
          AND user_id = ?
        `).get(
          task.project_id,
          assigned_to
        );

        if (!exists) {

          return res.status(400).json({
            error: 'Assigned user is not in project'
          });
        }
      }

      db.prepare(`
        UPDATE tasks
        SET
          title = ?,
          description = ?,
          priority = ?,
          due_date = ?,
          assigned_to = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(

        title?.trim() || task.title,

        description !== undefined
          ? description
          : task.description,

        priority || task.priority,

        due_date || task.due_date,

        assigned_to !== undefined
          ? assigned_to
          : task.assigned_to,

        status || task.status,

        req.params.taskId
      );
    }

    const updatedTask = db.prepare(`
      SELECT
        t.*,
        u.name as assignee_name,
        cu.name as creator_name

      FROM tasks t

      LEFT JOIN users u
        ON u.id = t.assigned_to

      LEFT JOIN users cu
        ON cu.id = t.created_by

      WHERE t.id = ?
    `).get(req.params.taskId);

    res.json({
      task: updatedTask
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Failed to update task'
    });
  }
});



// =========================
// DELETE TASK
// =========================

router.delete('/:taskId', (req, res) => {

  try {

    const db = getDb();

    const task = db.prepare(`
      SELECT *
      FROM tasks
      WHERE id = ?
    `).get(req.params.taskId);

    if (!task) {

      return res.status(404).json({
        error: 'Task not found'
      });
    }

    const member = db.prepare(`
      SELECT role
      FROM project_members
      WHERE project_id = ?
      AND user_id = ?
    `).get(task.project_id, req.user.id);

    if (!member || member.role !== 'admin') {

      return res.status(403).json({
        error: 'Only admins can delete tasks'
      });
    }

    db.prepare(`
      DELETE FROM tasks
      WHERE id = ?
    `).run(req.params.taskId);

    res.json({
      message: 'Task deleted'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Delete failed'
    });
  }
});

module.exports = router;