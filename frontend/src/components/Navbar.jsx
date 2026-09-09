import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiUser, FiLogOut, FiKey, FiActivity, FiMenu, FiX } from 'react-icons/fi';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export const Navbar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sticky top-0 z-40 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 text-gray-300 hover:text-white rounded-xl bg-gray-700/50 hover:bg-gray-700 transition"
          title="Toggle Navigation Menu"
        >
          {mobileOpen ? <FiX className="w-6 h-6 text-emerald-400" /> : <FiMenu className="w-6 h-6" />}
        </button>
        <div className="bg-emerald-500 p-2 rounded-xl text-gray-900 font-bold">
          <FiActivity className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <Link to="/" className="text-lg sm:text-xl font-extrabold tracking-wider text-white">
          FIT<span className="text-emerald-400">PULSE</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 text-gray-300 hover:text-emerald-400 relative rounded-lg hover:bg-gray-700 transition"
            title="Notifications"
          >
            <FiBell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                <span className="font-semibold text-gray-200">Notifications</span>
                <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                  {unreadCount} new
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-700">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`p-3 text-sm cursor-pointer transition ${
                        n.is_read ? 'bg-gray-800 text-gray-400' : 'bg-gray-700/50 text-white font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-emerald-400">{n.title}</span>
                        <span className="text-[10px] text-gray-400">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-xs text-gray-300">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-700 transition"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              {user?.first_name ? user.first_name[0] : user?.username[0].toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-white leading-tight">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium tracking-wide uppercase">
                {user?.role}
              </div>
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-1 z-50">
              <Link
                to="/change-password"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <FiKey className="mr-3" /> Change Password
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
              >
                <FiLogOut className="mr-3" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
