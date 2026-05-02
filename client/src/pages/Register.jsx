import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {

  const navigate = useNavigate();

  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // HANDLE SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {

      return alert('Please fill all fields');
    }

    try {

      setLoading(true);

      // ONLY THIS

      await register(formData);

      navigate('/dashboard');

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Registration failed'
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-black to-gray-900'>

      <form
        onSubmit={handleSubmit}
        className='bg-white p-10 rounded-2xl shadow-2xl w-[420px]'
      >

        <h1 className='text-4xl font-bold text-center mb-8'>
          Create Account
        </h1>

        {/* NAME */}

        <input
          type='text'
          name='name'
          placeholder='Full Name'
          value={formData.name}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-black'
        />

        {/* EMAIL */}

        <input
          type='email'
          name='email'
          placeholder='Email'
          value={formData.email}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-black'
        />

        {/* PASSWORD */}

        <input
          type='password'
          name='password'
          placeholder='Password'
          value={formData.password}
          onChange={handleChange}
          className='w-full border border-gray-300 p-4 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-black'
        />

        {/* BUTTON */}

        <button
          disabled={loading}
          className='w-full bg-black text-white py-4 rounded-xl text-lg hover:bg-gray-800 transition disabled:opacity-50'
        >

          {
            loading
              ? 'Creating Account...'
              : 'Register'
          }

        </button>

        {/* LOGIN */}

        <p className='text-center mt-5 text-gray-600'>

          Already have an account?{' '}

          <Link
            to='/'
            className='text-black font-bold'
          >
            Login
          </Link>

        </p>

      </form>

    </div>
  );
}

export default Register;