import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiActivity, FiLock, FiUser } from 'react-icons/fi';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(username, password);
      if (userData.role === 'TRAINER') {
        navigate('/trainer');
      } else {
        navigate('/client');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-gray-950 mb-4 shadow-xl shadow-emerald-500/20">
          <FiActivity className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          FIT<span className="text-emerald-400">PULSE</span>
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Personal Gym Trainer & Client Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 border border-gray-800 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-950/80 border border-red-800 text-red-300 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300">Username or Email</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FiUser />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border border-gray-700 block w-full pl-10 pr-3 py-2.5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Enter username or email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <FiLock />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border border-gray-700 block w-full pl-10 pr-3 py-2.5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-600/30 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center mt-4">
              <Link to="/register-trainer" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                New Trainer? Register Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
