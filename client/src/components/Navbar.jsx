import { FiBell, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
function Navbar() {

  const { user, logout } = useAuth();

  return (

    <div className='h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-50'>

      {/* LEFT */}

      <div>

        <h1 className='text-3xl font-black text-gray-800'>
          TaskFlow
        </h1>

        <p className='text-sm text-gray-500'>
          Team Collaboration Workspace
        </p>

      </div>

      {/* RIGHT */}

      <div className='flex items-center gap-5'>

        <div className='hidden md:flex items-center bg-gray-100 px-4 py-3 rounded-2xl w-[280px]'>

          <FiSearch className='text-gray-400 text-lg' />

          <input
            type='text'
            placeholder='Search tasks, projects...'
            className='bg-transparent outline-none ml-3 w-full text-sm'
          />

        </div>

        <button className='w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition'>
          <FiBell className='text-xl text-gray-700' />
        </button>

        <div className='flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-2xl'>

          <div className='w-11 h-11 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold'>
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div>
            <h3 className='font-bold text-gray-800'>
              {user?.name || 'User'}
            </h3>

            <p className='text-xs text-gray-500'>
              {user?.email}
            </p>
          </div>

        </div>

        <button
          onClick={logout}
          className='bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold transition'
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;