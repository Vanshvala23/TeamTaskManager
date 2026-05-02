import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) {

    return (
      <div className='h-screen flex items-center justify-center text-2xl font-bold'>
        Loading...
      </div>
    );
  }

  if (!user) {

    return <Navigate to='/' />;
  }

  if (user.role !== 'admin') {

    return <Navigate to='/dashboard' />;
  }

  return children;
}

export default AdminRoute;