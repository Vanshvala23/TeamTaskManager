import { Link, useLocation } from 'react-router-dom';

import {
  FiHome,
  FiFolder,
  FiCheckSquare,
  FiBarChart2,
  FiSettings
} from 'react-icons/fi';

function Sidebar() {

  const location = useLocation();

  const menus = [
    {
      title: 'Dashboard',
      icon: <FiHome />,
      path: '/dashboard'
    },
    {
      title: 'Projects',
      icon: <FiFolder />,
      path: '/projects'
    },
    {
      title: 'Tasks',
      icon: <FiCheckSquare />,
      path: '/tasks'
    }
  ];

  return (

    <div className='w-[290px] bg-[#0f172a] text-white min-h-screen px-6 py-8 flex flex-col'>

      {/* LOGO */}

      <div className='mb-12'>

        <div className='flex items-center gap-4'>

          <div className='w-14 h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-2xl font-black'>
            T
          </div>

          <div>
            <h1 className='text-3xl font-black'>
              TaskFlow
            </h1>

            <p className='text-slate-400 text-sm'>
              Team Workspace
            </p>
          </div>

        </div>

      </div>

      {/* MENUS */}

      <div className='space-y-3'>

        {menus.map((menu) => {

          const active = location.pathname === menu.path;

          return (

            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-lg font-medium ${
                active
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >

              <span className='text-2xl'>
                {menu.icon}
              </span>

              {menu.title}

            </Link>
          );
        })}

      </div>

      {/* FOOTER */}

      <div className='mt-auto bg-slate-800 rounded-3xl p-5'>

        <div className='flex items-center gap-3 mb-3'>

          <FiBarChart2 className='text-2xl text-violet-400' />

          <h3 className='font-bold text-lg'>
            Productivity
          </h3>

        </div>

        <p className='text-slate-400 text-sm leading-6'>
          Manage your projects, collaborate with teams and track progress beautifully.
        </p>

      </div>

    </div>
  );
}

export default Sidebar;