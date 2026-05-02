import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    checkAuth();

  }, []);

  const checkAuth = async () => {

    const token = localStorage.getItem('token');

    if (!token) {

      setLoading(false);

      return;
    }

    try {

      const res = await API.get('/auth/me');

      setUser(res.data.user);

    } catch (error) {

      console.log(error);

      localStorage.removeItem('token');

      setUser(null);

    } finally {

      setLoading(false);
    }
  };

  const login = async (email, password) => {

    const res = await API.post('/auth/login', {
      email,
      password
    });

    localStorage.setItem(
      'token',
      res.data.token
    );

    setUser(res.data.user);

    return res.data;
  };

  const register = async (data) => {

    const res = await API.post(
      '/auth/signup',
      data
    );

    return res.data;
  };

  const logout = () => {

    localStorage.removeItem('token');

    setUser(null);
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);