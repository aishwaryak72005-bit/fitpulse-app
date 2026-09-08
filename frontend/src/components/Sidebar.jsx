import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiUsers, FiDollarSign, FiSend, FiActivity,
  FiCalendar, FiPieChart, FiCheckSquare, FiCamera, FiCreditCard
} from 'react-icons/fi';

export const Sidebar = () => {
  const { role } = useAuth();

  const trainerLinks = [
    { to: '/trainer', label: 'Dashboard', icon: FiGrid },
    { to: '/trainer/clients', label: 'Client Management', icon: FiUsers },
    { to: '/trainer/payments', label: 'Payments & Revenue', icon: FiDollarSign },
    { to: '/trainer/notifications', label: 'Broadcast Alerts', icon: FiSend },
  ];

  const clientLinks = [
    { to: '/client', label: 'Overview', icon: FiGrid },
    { to: '/client/workouts', label: 'My Workouts', icon: FiActivity },
    { to: '/client/diet', label: 'My Diet Plan', icon: FiPieChart },
    { to: '/client/checkin', label: 'Daily Check-In', icon: FiCheckSquare },
    { to: '/client/progress', label: 'Progress Analytics', icon: FiCalendar },
    { to: '/client/photos', label: 'Progress Photos', icon: FiCamera },
    { to: '/client/payments', label: 'My Subscription', icon: FiCreditCard },
  ];

  const links = role === 'TRAINER' ? trainerLinks : clientLinks;

  return (
    <aside className="w-64 bg-gray-800/80 backdrop-blur-md border-r border-gray-700 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {role === 'TRAINER' ? 'Trainer Workspace' : 'Client Portal'}
          </h3>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/trainer' || link.to === '/client'}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-700/50 text-xs text-gray-400">
        <p className="font-semibold text-gray-300 mb-1">FitPulse V1.0</p>
        <p>Personal Gym Trainer & Client Management</p>
      </div>
    </aside>
  );
};
