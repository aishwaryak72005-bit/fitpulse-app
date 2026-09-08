import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  FiUser, FiActivity, FiPieChart, FiCheckSquare, FiCamera,
  FiPlus, FiTrash2, FiFileText, FiUpload, FiArrowLeft,
  FiZap, FiCalendar, FiColumns, FiX
} from 'react-icons/fi';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ClientDetail = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Tab Data
  const [workouts, setWorkouts] = useState([]);
  const [diet, setDiet] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState(null);

  // Photo Lightbox Modal
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Workout Form
  const [newWorkout, setNewWorkout] = useState({
    day: 'Monday',
    exercise_name: '',
    sets: 3,
    reps: 10,
    notes: ''
  });

  // Diet Form
  const [dietForm, setDietForm] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 60,
    water_goal: 3.5
  });

  // Before & After Modal State
  const [compareModal, setCompareModal] = useState(false);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);

  useEffect(() => {
    fetchClientDetail();
  }, [id]);

  const fetchClientDetail = async () => {
    try {
      const [cRes, wRes, dRes, chRes, pRes, rRes] = await Promise.all([
        api.get(`/clients/${id}/`),
        api.get(`/workout-plans/?client_id=${id}`),
        api.get(`/diet-plans/?client_id=${id}`),
        api.get(`/daily-checkins/?client_id=${id}`),
        api.get(`/progress-photos/?client_id=${id}`),
        api.get(`/reports/weekly/?client_id=${id}`)
      ]);
      setClient(cRes.data);
      setWorkouts(wRes.data);
      if (dRes.data.length > 0) {
        setDiet(dRes.data[0]);
        setDietForm(dRes.data[0]);
      }
      setCheckIns(chRes.data);
      setPhotos(pRes.data);
      setWeeklyReport(rRes.data);
    } catch (err) {
      console.error('Error fetching client detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !client) return;

    setUploadingPhoto(true);
    const data = new FormData();
    data.append('profile_photo', selectedFile);

    try {
      const res = await api.patch(`/clients/${client.id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setClient(res.data);
      setSelectedFile(null);
      alert('Client profile photo updated successfully!');
    } catch (err) {
      alert('Error uploading profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workout-plans/', { ...newWorkout, client: client.id });
      setNewWorkout({ day: 'Monday', exercise_name: '', sets: 3, reps: 10, notes: '' });
      fetchClientDetail();
    } catch (err) {
      alert('Error adding workout plan');
    }
  };

  const handleDeleteWorkout = async (wId) => {
    try {
      await api.delete(`/workout-plans/${wId}/`);
      fetchClientDetail();
    } catch (err) {
      alert('Error deleting workout');
    }
  };

  const handleUpdateDiet = async (e) => {
    e.preventDefault();
    try {
      if (diet?.id) {
        await api.put(`/diet-plans/${diet.id}/`, { ...dietForm, client: client.id });
      } else {
        await api.post('/diet-plans/', { ...dietForm, client: client.id });
      }
      alert('Diet plan updated successfully!');
      fetchClientDetail();
    } catch (err) {
      alert('Error updating diet plan');
    }
  };

  if (loading) {
    return <div className="p-8 text-emerald-400 font-semibold">Loading Client Profile...</div>;
  }

  if (!client) {
    return <div className="p-8 text-red-400">Client not found or access forbidden.</div>;
  }

  const weightChartData = checkIns
    .slice()
    .reverse()
    .map((c) => ({
      date: c.date,
      weight: c.weight,
    }));

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/trainer/clients"
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPhotoModal(true)}
            className="relative group focus:outline-none"
            title="Click to view/update profile photo"
          >
            {client.profile_photo ? (
              <img
                src={client.profile_photo}
                alt={client.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 group-hover:scale-105 transition shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-bold text-lg flex items-center justify-center border-2 border-emerald-500 group-hover:scale-105 transition shadow-md">
                {client.full_name ? client.full_name[0].toUpperCase() : 'C'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 bg-gray-900 border border-gray-700 p-1 rounded-full text-emerald-400 opacity-0 group-hover:opacity-100 transition">
              <FiCamera className="w-3 h-3" />
            </span>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{client.full_name}</h1>
            <p className="text-xs text-gray-400">{client.email} | Phone: {client.phone}</p>
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Fitness Goal</span>
          <p className="text-sm font-bold text-emerald-400 mt-1">{client.fitness_goal}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Current / Goal Weight</span>
          <p className="text-sm font-bold text-white mt-1">
            {client.current_weight} kg <span className="text-xs text-gray-400">/ {client.goal_weight} kg</span>
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Workout Time</span>
          <p className="text-sm font-mono font-bold text-white mt-1">{client.workout_time}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Workout Streak</span>
          <p className="text-sm font-bold text-amber-400 mt-1">🔥 {client.current_streak} days</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Status</span>
          <div className="mt-1 font-bold text-xs">
            {client.check_in_status === 'ON_TRACK' && <span className="text-emerald-400">🟢 On Track</span>}
            {client.check_in_status === 'MISSED_TODAY' && <span className="text-amber-400">🟡 Missed Check-In</span>}
            {client.check_in_status === 'INACTIVE' && <span className="text-red-400">🔴 Inactive 3+ Days</span>}
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-gray-700 flex space-x-4">
        {[
          { key: 'overview', label: 'Overview & Report', icon: FiUser },
          { key: 'workouts', label: 'Workout Plans', icon: FiActivity },
          { key: 'diet', label: 'Diet Plan', icon: FiPieChart },
          { key: 'checkins', label: 'Daily Check-Ins', icon: FiCheckSquare },
          { key: 'photos', label: 'Progress Photos', icon: FiCamera },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center pb-3 px-2 border-b-2 font-bold text-sm transition ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="mr-2" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & REPORT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight History Chart */}
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Weight Progression History</h3>
            {weightChartData.length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center">No check-in weight data available yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#FFF' }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Weekly Report Card */}
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <h3 className="font-bold text-white text-base">Automatic Weekly Progress Report</h3>
              <span className="text-xs text-emerald-400 font-mono">{weeklyReport?.report_period}</span>
            </div>
            {weeklyReport && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-700">
                  <span className="text-xs text-gray-400">Weight Change (7d)</span>
                  <p className="text-lg font-bold text-white mt-1">
                    {weeklyReport.weight_change > 0 ? `+${weeklyReport.weight_change}` : weeklyReport.weight_change} kg
                  </p>
                </div>
                <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-700">
                  <span className="text-xs text-gray-400">Workout Completion %</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{weeklyReport.workout_completion_pct}%</p>
                </div>
                <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-700">
                  <span className="text-xs text-gray-400">Protein Goal Achieved</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{weeklyReport.protein_achievement_pct}%</p>
                </div>
                <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-700">
                  <span className="text-xs text-gray-400">Check-In Consistency</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{weeklyReport.checkin_consistency_pct}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WORKOUT PLANS */}
      {activeTab === 'workouts' && (
        <div className="space-y-6">
          {/* Add Workout Form */}
          <form onSubmit={handleAddWorkout} className="bg-gray-800 border border-gray-700 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Day</label>
              <select
                value={newWorkout.day}
                onChange={(e) => setNewWorkout({ ...newWorkout, day: e.target.value })}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 mb-1">Exercise Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Barbell Bench Press"
                value={newWorkout.exercise_name}
                onChange={(e) => setNewWorkout({ ...newWorkout, exercise_name: e.target.value })}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Sets</label>
              <input
                type="number"
                value={newWorkout.sets}
                onChange={(e) => setNewWorkout({ ...newWorkout, sets: parseInt(e.target.value) })}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Reps</label>
              <input
                type="number"
                value={newWorkout.reps}
                onChange={(e) => setNewWorkout({ ...newWorkout, reps: parseInt(e.target.value) })}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30 flex items-center justify-center"
            >
              <FiPlus className="mr-1" /> Add
            </button>
          </form>

          {/* Assigned Workouts List By Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName) => {
              const dayWorkouts = workouts.filter((w) => w.day === dayName);
              return (
                <div key={dayName} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="font-bold text-emerald-400 text-sm">{dayName}</span>
                    <span className="text-xs text-gray-400">{dayWorkouts.length} Exercises</span>
                  </div>
                  {dayWorkouts.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-2">Rest Day / No exercises assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {dayWorkouts.map((w) => (
                        <div key={w.id} className="bg-gray-900/60 p-2.5 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-white">{w.exercise_name}</div>
                            <div className="text-gray-400">{w.sets} Sets × {w.reps} Reps</div>
                          </div>
                          <button
                            onClick={() => handleDeleteWorkout(w.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DIET PLAN */}
      {activeTab === 'diet' && (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl max-w-2xl space-y-6">
          <h3 className="font-bold text-white text-base">Assign Macro-Based Diet Plan</h3>
          <form onSubmit={handleUpdateDiet} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={dietForm.calories}
                  onChange={(e) => setDietForm({ ...dietForm, calories: parseInt(e.target.value) })}
                  className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={dietForm.protein}
                  onChange={(e) => setDietForm({ ...dietForm, protein: parseInt(e.target.value) })}
                  className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Carbohydrates (g)</label>
                <input
                  type="number"
                  value={dietForm.carbs}
                  onChange={(e) => setDietForm({ ...dietForm, carbs: parseInt(e.target.value) })}
                  className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Fats (g)</label>
                <input
                  type="number"
                  value={dietForm.fats}
                  onChange={(e) => setDietForm({ ...dietForm, fats: parseInt(e.target.value) })}
                  className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Water Goal (Liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dietForm.water_goal}
                  onChange={(e) => setDietForm({ ...dietForm, water_goal: parseFloat(e.target.value) })}
                  className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
            >
              Save Diet Plan
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: CHECK-INS */}
      {activeTab === 'checkins' && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Weight</th>
                <th className="py-3 px-4 font-semibold">Protein Intake</th>
                <th className="py-3 px-4 font-semibold">Water Intake</th>
                <th className="py-3 px-4 font-semibold">Steps / Sleep</th>
                <th className="py-3 px-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              {checkIns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">No daily check-ins recorded yet.</td>
                </tr>
              ) : (
                checkIns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-700/30">
                    <td className="py-3 px-4 font-bold text-white">{c.date}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">{c.weight} kg</td>
                    <td className="py-3 px-4">{c.protein} g</td>
                    <td className="py-3 px-4">{c.water} L</td>
                    <td className="py-3 px-4 text-xs text-gray-400">{c.steps} steps | {c.sleep} hrs</td>
                    <td className="py-3 px-4 text-xs text-gray-300">{c.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: PROGRESS PHOTOS & BEFORE VS AFTER */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Client Progress Photo Gallery</h3>
            {photos.length >= 2 && (
              <button
                onClick={() => {
                  setBeforePhoto(photos[photos.length - 1]);
                  setAfterPhoto(photos[0]);
                  setCompareModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition flex items-center shadow-lg shadow-emerald-900/30"
              >
                <FiColumns className="mr-2" /> Compare Before vs After
              </button>
            )}
          </div>

          {photos.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl text-center text-gray-400">
              No progress photos uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {photos.map((p) => (
                <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-semibold text-emerald-400 font-mono">
                    {new Date(p.uploaded_at).toLocaleDateString()}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-1">Front</span>
                      <img src={p.front_photo || 'https://via.placeholder.com/150'} alt="Front" className="w-full h-24 object-cover rounded-lg border border-gray-700" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-1">Side</span>
                      <img src={p.side_photo || 'https://via.placeholder.com/150'} alt="Side" className="w-full h-24 object-cover rounded-lg border border-gray-700" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-1">Back</span>
                      <img src={p.back_photo || 'https://via.placeholder.com/150'} alt="Back" className="w-full h-24 object-cover rounded-lg border border-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CLIENT PROFILE PHOTO LIGHTBOX MODAL */}
      {showPhotoModal && client && (
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
              {client.profile_photo ? (
                <img
                  src={client.profile_photo}
                  alt={client.full_name}
                  className="w-48 h-48 rounded-2xl object-cover border-4 border-emerald-500 shadow-2xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-emerald-950 text-emerald-400 font-extrabold text-6xl flex items-center justify-center border-4 border-emerald-500 shadow-2xl">
                  {client.full_name ? client.full_name[0].toUpperCase() : 'C'}
                </div>
              )}

              <div className="text-center">
                <h4 className="text-xl font-bold text-white">{client.full_name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{client.email} | {client.phone}</p>
                <p className="text-xs text-emerald-400 font-semibold mt-1">Goal: {client.fitness_goal}</p>
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

      {/* BEFORE VS AFTER MODAL */}
      {compareModal && beforePhoto && afterPhoto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-bold text-white">Before vs After Progress Comparison</h3>
              <button onClick={() => setCompareModal(false)} className="text-gray-400 hover:text-white font-bold">✕ Close</button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-center space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">BEFORE ({new Date(beforePhoto.uploaded_at).toLocaleDateString()})</span>
                <img src={beforePhoto.front_photo || 'https://via.placeholder.com/200'} alt="Before" className="w-full h-64 object-cover rounded-xl" />
              </div>
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-center space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">AFTER ({new Date(afterPhoto.uploaded_at).toLocaleDateString()})</span>
                <img src={afterPhoto.front_photo || 'https://via.placeholder.com/200'} alt="After" className="w-full h-64 object-cover rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
