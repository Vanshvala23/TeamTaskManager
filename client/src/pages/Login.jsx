import { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import API from '../services/api';

import toast from 'react-hot-toast';

function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({

    email: '',

    password: ''
  });

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const toastId = toast.loading(
        'Signing in...'
      );

      const res = await API.post(
        '/auth/login',
        formData
      );

      localStorage.setItem(
        'token',
        res.data.token
      );

      await login(
        formData.email,
        formData.password
      );

      toast.success(
        'Login successful!',
        { id: toastId }
      );

      navigate('/dashboard');

    } catch (error) {

      toast.error(

        error?.response?.data?.message ||

        'Login failed'

      );

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-900 px-4'>

      <form
        onSubmit={handleSubmit}
        className='bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md'
      >

        <h1 className='text-4xl font-black text-center mb-3 text-gray-800'>
          Welcome Back
        </h1>

        <p className='text-center text-gray-500 mb-8'>
          Login to continue managing your projects
        </p>

        <input
          type='email'
          name='email'
          placeholder='Email'
          value={formData.email}
          onChange={handleChange}
          required
          className='w-full border border-gray-300 p-4 rounded-2xl mb-5 focus:outline-none focus:ring-2 focus:ring-violet-600 transition'
        />

        <input
          type='password'
          name='password'
          placeholder='Password'
          value={formData.password}
          onChange={handleChange}
          required
          className='w-full border border-gray-300 p-4 rounded-2xl mb-6 focus:outline-none focus:ring-2 focus:ring-violet-600 transition'
        />

        <button
          disabled={loading}
          className='w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-2xl text-lg font-semibold hover:scale-[1.02] transition disabled:opacity-70'
        >

          {loading ? 'Signing In...' : 'Login'}

        </button>

        <p className='text-center mt-6 text-gray-600'>

          Don't have an account?{' '}

          <Link
            to='/register'
            className='text-violet-700 font-bold hover:underline'
          >
            Register
          </Link>

        </p>

      </form>

    </div>
  );
}

export default Login;