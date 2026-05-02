import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import API from '../services/api';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const res = await API.post('/auth/login', formData);

      localStorage.setItem('token', res.data.token);

       await login(formData.email, formData.password);
      navigate('/dashboard');

    } catch (error) {
      alert(
        error?.response?.data?.message ||
        'Login failed'
      );
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-black'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-10 rounded-2xl shadow-2xl w-[400px]'
      >
        <h1 className='text-4xl font-bold text-center mb-8'>
          Welcome Back
        </h1>

        <input
          type='email'
          name='email'
          placeholder='Email'
          className='w-full border border-gray-300 p-4 rounded-xl mb-5 focus:outline-none focus:ring-2 focus:ring-black'
          onChange={handleChange}
        />

        <input
          type='password'
          name='password'
          placeholder='Password'
          className='w-full border border-gray-300 p-4 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-black'
          onChange={handleChange}
        />

        <button className='w-full bg-black text-white py-4 rounded-xl text-lg hover:bg-gray-800 transition'>
          Login
        </button>

        <p className='text-center mt-5 text-gray-600'>
          Don't have an account?{' '}

          <Link
            to='/register'
            className='text-black font-bold'
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;