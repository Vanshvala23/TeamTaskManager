import { useEffect, useState } from 'react';

import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';

function Tasks() {

  const [tasks, setTasks] = useState([]);

  const [projects, setProjects] = useState([]);

  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState(null);

  const [formData, setFormData] = useState({

    project_id: '',

    title: '',

    description: '',

    priority: 'medium',

    due_date: '',

    assigned_to: ''

  });

  useEffect(() => {

    fetchProjects();

  }, []);

  // =========================
  // FETCH PROJECTS
  // =========================

  const fetchProjects = async () => {

    try {

      const res = await API.get('/projects');

      setProjects(res.data.projects || []);

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to fetch projects'
      );
    }
  };

  // =========================
  // FETCH PROJECT MEMBERS
  // =========================

  const fetchMembers = async (projectId) => {

    try {

      const res = await API.get(
        `/projects/${projectId}`
      );

      setMembers(res.data.members || []);

    } catch (error) {

      console.log(error);
    }
  };

  // =========================
  // FETCH TASKS
  // =========================

  const fetchTasks = async (projectId) => {

    if (!projectId) return;

    try {

      setLoading(true);

      const res = await API.get(
        `/tasks/project/${projectId}`
      );

      setTasks(res.data.tasks || []);

      fetchMembers(projectId);

    } catch (error) {

      console.log(error);

      setTasks([]);

      alert(
        error?.response?.data?.error ||
        'Failed to fetch tasks'
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

    if (e.target.name === 'project_id') {

      fetchTasks(e.target.value);
    }
  };

  // =========================
  // CREATE TASK
  // =========================

  const createTask = async (e) => {

    e.preventDefault();

    if (
      !formData.project_id ||
      !formData.title.trim()
    ) {

      return alert(
        'Project and title required'
      );
    }

    try {

      setCreating(true);

      const payload = {

        ...formData,

        assigned_to:
          formData.assigned_to || null
      };

      const res = await API.post(
        '/tasks',
        payload
      );

      setTasks((prev) => [
        res.data.task,
        ...prev
      ]);

      setFormData({

        project_id: formData.project_id,

        title: '',

        description: '',

        priority: 'medium',

        due_date: '',

        assigned_to: ''

      });

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to create task'
      );

    } finally {

      setCreating(false);
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (task) => {

    setEditingTaskId(task.id);

    setFormData({

      project_id: task.project_id,

      title: task.title,

      description: task.description || '',

      priority: task.priority || 'medium',

      due_date: task.due_date || '',

      assigned_to: task.assigned_to || ''

    });
  };

  // =========================
  // UPDATE TASK
  // =========================

  const updateTask = async (e) => {

    e.preventDefault();

    try {

      setCreating(true);

      const res = await API.put(
        `/tasks/${editingTaskId}`,
        {
          ...formData,
          assigned_to:
            formData.assigned_to || null
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId
            ? res.data.task
            : task
        )
      );

      cancelEdit();

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to update task'
      );

    } finally {

      setCreating(false);
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async (taskId) => {

    const confirmDelete = window.confirm(
      'Delete this task?'
    );

    if (!confirmDelete) return;

    try {

      await API.delete(`/tasks/${taskId}`);

      setTasks((prev) =>
        prev.filter((task) =>
          task.id !== taskId
        )
      );

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to delete task'
      );
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (
    taskId,
    status
  ) => {

    try {

      const res = await API.put(
        `/tasks/${taskId}`,
        { status }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? res.data.task
            : task
        )
      );

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to update status'
      );
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {

    setEditingTaskId(null);

    setFormData({

      project_id: '',

      title: '',

      description: '',

      priority: 'medium',

      due_date: '',

      assigned_to: ''

    });
  };

  // =========================
  // COLORS
  // =========================

  const getStatusColor = (status) => {

    switch (status) {

      case 'todo':
        return 'bg-yellow-100 text-yellow-700';

      case 'inprogress':
        return 'bg-blue-100 text-blue-700';

      case 'done':
        return 'bg-green-100 text-green-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {

    switch (priority) {

      case 'urgent':
        return 'text-red-600';

      case 'high':
        return 'text-orange-500';

      case 'medium':
        return 'text-yellow-500';

      case 'low':
        return 'text-green-500';

      default:
        return 'text-gray-500';
    }
  };

  return (

    <DashboardLayout>

      {/* HEADER */}

      <div className='mb-8'>

        <h1 className='text-4xl font-bold text-gray-800'>
          Tasks
        </h1>

        <p className='text-gray-500 mt-2'>
          Manage project tasks efficiently
        </p>

      </div>

      {/* FORM */}

      <form
        onSubmit={
          editingTaskId
            ? updateTask
            : createTask
        }
        className='bg-white p-6 rounded-2xl shadow-lg mb-10'
      >

        <h2 className='text-2xl font-bold mb-6'>

          {
            editingTaskId
              ? 'Edit Task'
              : 'Create New Task'
          }

        </h2>

        {/* PROJECT */}

        <select
          name='project_id'
          value={formData.project_id}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-4'
        >

          <option value=''>
            Select Project
          </option>

          {projects.map((project) => (

            <option
              key={project.id}
              value={project.id}
            >
              {project.name}
            </option>
          ))}

        </select>

        {/* TITLE */}

        <input
          type='text'
          name='title'
          placeholder='Task Title'
          value={formData.title}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-4'
        />

        {/* DESCRIPTION */}

        <textarea
          name='description'
          placeholder='Task Description'
          value={formData.description}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-4 h-32 resize-none'
        />

        {/* PRIORITY */}

        <select
          name='priority'
          value={formData.priority}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-4'
        >

          <option value='low'>
            Low
          </option>

          <option value='medium'>
            Medium
          </option>

          <option value='high'>
            High
          </option>

          <option value='urgent'>
            Urgent
          </option>

        </select>

        {/* ASSIGN MEMBER */}

        <select
          name='assigned_to'
          value={formData.assigned_to}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-4'
        >

          <option value=''>
            Unassigned
          </option>

          {members.map((member) => (

            <option
              key={member.id}
              value={member.id}
            >
              {member.name}
            </option>
          ))}

        </select>

        {/* DUE DATE */}

        <input
          type='date'
          name='due_date'
          value={formData.due_date}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-6'
        />

        {/* BUTTONS */}

        <div className='flex gap-4'>

          <button
            disabled={creating}
            className='bg-black text-white px-8 py-3 rounded-xl'
          >

            {
              creating
                ? (
                  editingTaskId
                    ? 'Updating...'
                    : 'Creating...'
                )
                : (
                  editingTaskId
                    ? 'Update Task'
                    : 'Create Task'
                )
            }

          </button>

          {
            editingTaskId && (

              <button
                type='button'
                onClick={cancelEdit}
                className='bg-gray-300 px-8 py-3 rounded-xl'
              >
                Cancel
              </button>
            )
          }

        </div>

      </form>

      {/* LOADING */}

      {loading && (

        <div className='text-center text-xl font-semibold'>
          Loading Tasks...
        </div>
      )}

      {/* EMPTY */}

      {!loading && tasks.length === 0 && (

        <div className='bg-white rounded-2xl shadow p-10 text-center'>

          <h2 className='text-2xl font-bold text-gray-700'>
            No Tasks Found
          </h2>

        </div>
      )}

      {/* TASK GRID */}

      {!loading && tasks.length > 0 && (

        <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>

          {tasks.map((task) => (

            <div
              key={task.id}
              className='bg-white p-6 rounded-2xl shadow-lg'
            >

              {/* TOP */}

              <div className='flex items-start justify-between mb-4'>

                <h2 className='text-2xl font-bold'>
                  {task.title}
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
                >
                  {task.status}
                </span>

              </div>

              {/* DESCRIPTION */}

              <p className='text-gray-600 min-h-[80px]'>
                {
                  task.description ||
                  'No description'
                }
              </p>

              {/* INFO */}

              <div className='mt-6 space-y-3'>

                <div className='flex justify-between'>

                  <span>
                    Priority
                  </span>

                  <span
                    className={`font-bold capitalize ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>

                </div>

                <div className='flex justify-between'>

                  <span>
                    Assigned
                  </span>

                  <span>
                    {
                      task.assignee_name ||
                      'Unassigned'
                    }
                  </span>

                </div>

                <div className='flex justify-between'>

                  <span>
                    Due
                  </span>

                  <span>
                    {
                      task.due_date ||
                      'No deadline'
                    }
                  </span>

                </div>

              </div>

              {/* STATUS */}

              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(
                    task.id,
                    e.target.value
                  )
                }
                className='w-full border border-gray-300 p-3 rounded-xl mt-6'
              >

                <option value='todo'>
                  To Do
                </option>

                <option value='inprogress'>
                  In Progress
                </option>

                <option value='done'>
                  Done
                </option>

              </select>

              {/* ACTIONS */}

              <div className='flex gap-3 mt-4'>

                <button
                  onClick={() =>
                    startEdit(task)
                  }
                  className='flex-1 bg-blue-600 text-white py-2 rounded-xl'
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteTask(task.id)
                  }
                  className='flex-1 bg-red-600 text-white py-2 rounded-xl'
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </DashboardLayout>
  );
}

export default Tasks;