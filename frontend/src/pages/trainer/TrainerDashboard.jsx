import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  FiUsers, FiUserCheck, FiUserX, FiClock, FiDollarSign,
  FiAlertTriangle, FiSearch, FiChevronRight, FiPlus, FiCamera, FiX, FiUpload
} from 'react-icons/fi';

import { Avatar } from '../../components/Avatar';

export const TrainerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Photo Modal State
  const [photoClient, setPhotoClient] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, clientsRes] = await Promise.all([
        api.get('/trainer/stats/'),
        api.get('/clients/'),
      ]);
      setStats(statsRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      console.error('Error loading trainer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !photoClient) return;

    setUploadingPhoto(true);
    const data = new FormData();
    data.append('profile_photo', selectedFile);

    try {
      const res = await api.patch(`/clients/${photoClient.id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotoClient(res.data);
      setSelectedFile(null);
      fetchDashboardData();
      alert('Client profile photo updated successfully!');
    } catch (err) {
      alert('Error uploading profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.fitness_goal.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ON_TRACK') return matchesSearch && c.check_in_status === 'ON_TRACK';
    if (statusFilter === 'MISSED_TODAY') return matchesSearch && c.check_in_status === 'MISSED_TODAY';
    if (statusFilter === 'INACTIVE') return matchesSearch && c.check_in_status === 'INACTIVE';
    return matchesSearch;
  });

  const getStatusBadge = (st) => {
    if (st === 'ON_TRACK') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
          <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          🟢 On Track
        </span>
      );
    } else if (st === 'MISSED_TODAY') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
          <span className="w-2 h-2 mr-1.5 rounded-full bg-amber-400"></span>
          🟡 Missed Check-In
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-950 text-red-400 border border-red-800">
          <span className="w-2 h-2 mr-1.5 rounded-full bg-red-400"></span>
          🔴 Inactive (3+ Days)
        </span>
      );
    }
  };

  if (loading) {
    return <div className="p-8 text-emerald-400 font-semibold">Loading Trainer Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-gray-800 via-gray-800 to-emerald-950 p-6 rounded-2xl border border-gray-700 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Trainer Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Manage client profiles, workout plans, diets, check-ins & payments</p>
        </div>
        <Link
          to="/trainer/clients"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-900/40"
        >
          <FiPlus className="w-5 h-5 mr-2" /> Add New Client
        </Link>
      </div>

      {/* Alert Banners */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-center justify-between text-sm font-medium ${
                alert.type === 'INACTIVE_3_DAYS'
                  ? 'bg-red-950/60 border-red-800 text-red-300'
                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FiAlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{alert.message}</span>
              </div>
              <Link
                to={`/trainer/clients/${alert.id}`}
                className="underline hover:text-white text-xs font-bold"
              >
                View Client Profile →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Clients</span>
            <FiUsers className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.total_clients || 0}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Active Clients</span>
            <FiUserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{stats?.active_clients || 0}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Inactive (3d+)</span>
            <FiUserX className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-extrabold text-red-400">{stats?.inactive_clients || 0}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Check-Ins Today</span>
            <FiClock className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.checkins_today || 0}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Pending Pay</span>
            <FiDollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{stats?.pending_payments || 0}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Monthly Rev</span>
            <FiDollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">₹{stats?.monthly_revenue || 0}</p>
        </div>
      </div>

      {/* Client Overview Table & Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-bold text-white">Client Roster & Daily Status</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search name, goal, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white pl-9 pr-3 py-1.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 w-60"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl p-1 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ALL' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('ON_TRACK')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ON_TRACK' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                🟢 On Track
              </button>
              <button
                onClick={() => setStatusFilter('MISSED_TODAY')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'MISSED_TODAY' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                🟡 Missed
              </button>
              <button
                onClick={() => setStatusFilter('INACTIVE')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'INACTIVE' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                🔴 Inactive
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Photo</th>
                <th className="py-3.5 px-4 font-semibold">Client Name</th>
                <th className="py-3.5 px-4 font-semibold">Fitness Goal</th>
                <th className="py-3.5 px-4 font-semibold">Current / Goal Wt</th>
                <th className="py-3.5 px-4 font-semibold">Workout Time</th>
                <th className="py-3.5 px-4 font-semibold">Streak</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-400">
                    No clients found matching filters.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-700/40 transition">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setPhotoClient(client);
                          setShowPhotoModal(true);
                        }}
                        className="relative group focus:outline-none"
                        title="Click to view/update profile photo"
                      >
                        <Avatar src={client.profile_photo} name={client.full_name} size="w-10 h-10" className="group-hover:scale-105 transition" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{client.full_name}</div>
                      <div className="text-xs text-gray-400">{client.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-emerald-300">
                      {client.fitness_goal}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {client.current_weight} kg <span className="text-xs text-gray-400">/ {client.goal_weight} kg</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-300 font-mono">
                      {client.workout_time}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      🔥 {client.current_streak} days
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(client.check_in_status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/trainer/clients/${client.id}`}
                        className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg transition"
                      >
                        Manage Profile <FiChevronRight className="ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLIENT PROFILE PHOTO LIGHTBOX MODAL */}
      {showPhotoModal && photoClient && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6 p-6">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center">
                <FiCamera className="mr-2 text-emerald-400" /> Client Profile Photo
              </h3>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedFile(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <Avatar src={photoClient.profile_photo} name={photoClient.full_name} size="w-48 h-48" textSize="text-6xl" className="rounded-2xl border-4" />

              <div className="text-center">
                <h4 className="text-xl font-bold text-white">{photoClient.full_name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{photoClient.email} | {photoClient.phone}</p>
                <p className="text-xs text-emerald-400 font-semibold mt-1">Goal: {photoClient.fitness_goal}</p>
              </div>
            </div>

            {/* Change / Upload Photo Form */}
            <form onSubmit={handlePhotoUpload} className="bg-gray-900 p-4 rounded-xl border border-gray-700 space-y-3">
              <label className="block text-xs font-semibold text-gray-300">
                Upload / Update Client Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="bg-gray-800 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-xs"
              />
              <button
                type="submit"
                disabled={!selectedFile || uploadingPhoto}
                className={`w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center ${
                  !selectedFile ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiUpload className="mr-2" /> {uploadingPhoto ? 'Uploading...' : 'Save Profile Photo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
