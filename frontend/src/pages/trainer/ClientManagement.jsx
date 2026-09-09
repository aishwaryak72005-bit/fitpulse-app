import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck,
  FiCamera, FiUpload, FiUser
} from 'react-icons/fi';

import { Avatar } from '../../components/Avatar';

export const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Photo Lightbox Modal State
  const [photoClient, setPhotoClient] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Add Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    age: 25,
    gender: 'Male',
    height: 170,
    starting_weight: 70,
    current_weight: 70,
    goal_weight: 65,
    fitness_goal: 'Fat Loss & Muscle Building',
    workout_time: '07:00:00',
    monthly_fee: 3000
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients/');
      setClients(res.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/clients/', formData);
      setShowAddModal(false);
      fetchClients();
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Error creating client');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.patch(`/clients/${selectedClient.id}/`, selectedClient);
      setShowEditModal(false);
      fetchClients();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error updating client');
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
      fetchClients();
      alert('Client profile photo updated successfully!');
    } catch (err) {
      alert('Error uploading profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete client ${name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/clients/${id}/`);
        fetchClients();
      } catch (err) {
        alert('Error deleting client');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      age: 25,
      gender: 'Male',
      height: 170,
      starting_weight: 70,
      current_weight: 70,
      goal_weight: 65,
      fitness_goal: 'Fat Loss & Muscle Building',
      workout_time: '07:00:00'
    });
    setFormError('');
  };

  const filteredClients = clients.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.fitness_goal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Client Management</h1>
          <p className="text-sm text-gray-400 mt-1">Create, view, update & remove client profiles</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-900/30"
        >
          <FiPlus className="w-5 h-5 mr-2" /> Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email or goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none focus:border-emerald-500 w-full"
          />
        </div>
        <span className="text-xs font-semibold text-gray-400">Total: {filteredClients.length} Clients</span>
      </div>

      {/* Client Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Client Photo</th>
                <th className="py-3.5 px-4 font-semibold">Name & Contact</th>
                <th className="py-3.5 px-4 font-semibold">Age / Gender</th>
                <th className="py-3.5 px-4 font-semibold">Goal</th>
                <th className="py-3.5 px-4 font-semibold">Current / Goal Wt</th>
                <th className="py-3.5 px-4 font-semibold">Workout Time</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-emerald-400">
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    No clients found.
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
                        <Avatar src={client.profile_photo} name={client.full_name} size="w-11 h-11" className="group-hover:scale-105 transition" />
                        <span className="absolute -bottom-1 -right-1 bg-gray-900 border border-gray-700 p-1 rounded-full text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                          <FiCamera className="w-3 h-3" />
                        </span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/trainer/clients/${client.id}`}
                        className="font-bold text-white hover:text-emerald-400 transition"
                      >
                        {client.full_name}
                      </Link>
                      <div className="text-xs text-gray-400">{client.email} | {client.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-300">
                      {client.age} yrs / {client.gender}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-emerald-300 font-medium">
                      {client.fitness_goal}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {client.current_weight} kg <span className="text-xs text-gray-400">/ {client.goal_weight} kg</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-300 font-mono">
                      {client.workout_time}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClient({ ...client });
                          setShowEditModal(true);
                        }}
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition"
                        title="Edit Client"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.full_name)}
                        className="p-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg transition"
                        title="Delete Client"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
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

      {/* ADD CLIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New Client Account</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-950 border border-red-800 text-red-300 p-3 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Starting Wt (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.starting_weight}
                    onChange={(e) => setFormData({ ...formData, starting_weight: parseFloat(e.target.value), current_weight: parseFloat(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Current Wt (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current_weight}
                    onChange={(e) => setFormData({ ...formData, current_weight: parseFloat(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Goal Wt (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.goal_weight}
                    onChange={(e) => setFormData({ ...formData, goal_weight: parseFloat(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Fitness Goal</label>
                  <input
                    type="text"
                    value={formData.fitness_goal}
                    onChange={(e) => setFormData({ ...formData, fitness_goal: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Workout Time</label>
                  <input
                    type="time"
                    value={formData.workout_time}
                    onChange={(e) => setFormData({ ...formData, workout_time: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.monthly_fee}
                    onChange={(e) => setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) || 0 })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                    placeholder="3000"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-900/30"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Client Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-950 border border-red-800 text-red-300 p-3 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={selectedClient.age}
                    onChange={(e) => setSelectedClient({ ...selectedClient, age: parseInt(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={selectedClient.phone}
                    onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedClient.height}
                    onChange={(e) => setSelectedClient({ ...selectedClient, height: parseFloat(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Current Wt (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedClient.current_weight}
                    onChange={(e) => setSelectedClient({ ...selectedClient, current_weight: parseFloat(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Goal Wt (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedClient.goal_weight}
                    onChange={(e) => setSelectedClient({ ...selectedClient, goal_weight: parseFloat(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Fitness Goal</label>
                <input
                  type="text"
                  value={selectedClient.fitness_goal}
                  onChange={(e) => setSelectedClient({ ...selectedClient, fitness_goal: e.target.value })}
                  className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Workout Time</label>
                <input
                  type="time"
                  value={selectedClient.workout_time}
                  onChange={(e) => setSelectedClient({ ...selectedClient, workout_time: e.target.value })}
                  className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
