import { useEffect, useState } from 'react';

import API from '../services/api';

import DashboardLayout from '../layouts/DashboardLayout';

import StatCard from '../components/StatCard';

import TaskCard from '../components/TaskCard';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();

  const [stats, setStats] = useState({

    total: 0,

    todo: 0,

    inprogress: 0,

    done: 0,

    overdue: 0

  });

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD DASHBOARD
  // =========================

  useEffect(() => {

    fetchDashboard();

  }, []);

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchDashboard = async () => {

    try {

      setLoading(true);

      // IMPORTANT:
      // Backend route:
      // /api/dashboard/stats

      const res = await API.get('/tasks/dashboard')

      console.log('Dashboard:', res.data);

      // SET STATS

      setStats({

        total: res.data.total || 0,

        todo: res.data.todo || 0,

        inprogress: res.data.inprogress || 0,

        done: res.data.done || 0,

        overdue: res.data.overdue || 0

      });

      // SET TASKS

      setTasks(
        res.data.recentTasks || []
      );

    } catch (error) {

      console.log(error);

      alert(

        error?.response?.data?.error ||

        error?.response?.data?.message ||

        'Failed to load dashboard'

      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      {/* HEADER */}

      <div className='mb-10 flex items-center justify-between'>

  <div>

    <h1 className='text-5xl font-black text-gray-800'>
      Dashboard
    </h1>

    <p className='text-gray-500 mt-3 text-lg'>
      Monitor your projects, team progress and productivity.
    </p>

  </div>

  <button
    onClick={() => navigate('/tasks')}
    className='bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-7 py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition'
  >
    + Create Task
  </button>

</div>
      {/* LOADING */}

      {loading && (

        <div className='text-center text-xl font-semibold py-20'>
          Loading Dashboard...
        </div>
      )}

      {/* CONTENT */}

      {!loading && (

        <>

          {/* STATS */}

          <div className='grid md:grid-cols-2 xl:grid-cols-5 gap-6 mb-10'>

            <StatCard
              title='Total Tasks'
              value={stats.total}
            />

            <StatCard
              title='To Do'
              value={stats.todo}
            />

            <StatCard
              title='In Progress'
              value={stats.inprogress}
            />

            <StatCard
              title='Completed'
              value={stats.done}
            />

            <StatCard
              title='Overdue'
              value={stats.overdue}
            />

          </div>

          {/* RECENT TASKS */}

          <div>

            <div className='flex items-center justify-between mb-5'>

              <h2 className='text-2xl font-bold'>
                Recent Tasks
              </h2>

              <button
                onClick={fetchDashboard}
                className='bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition'
              >
                Refresh
              </button>

            </div>

            {/* EMPTY STATE */}

            {tasks.length === 0 ? (

              <div className='bg-white p-10 rounded-2xl shadow text-center'>

                <h3 className='text-2xl font-bold text-gray-700 mb-3'>
                  No Tasks Available
                </h3>

                <p className='text-gray-500'>
                  Create tasks inside projects to see them here.
                </p>

              </div>

            ) : (

              <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>

                {tasks.map((task) => (

                  <TaskCard
                    key={task.id}
                    task={task}
                  />

                ))}

              </div>
            )}

          </div>

        </>
      )}

    </DashboardLayout>
  );
}

export default Dashboard;