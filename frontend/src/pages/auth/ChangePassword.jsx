import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiKey, FiCheckCircle } from 'react-icons/fi';

export const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.old_password?.[0] || err.response?.data?.detail || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
            <FiKey className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Change Account Password</h2>
        </div>

        {message && (
          <div className="mb-4 bg-emerald-950 border border-emerald-800 text-emerald-300 p-3 rounded-xl flex items-center text-sm">
            <FiCheckCircle className="mr-2 w-5 h-5 flex-shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-950 border border-red-800 text-red-300 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
