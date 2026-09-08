import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiCheckSquare, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

export const DailyCheckInPage = () => {
  const [clientProfile, setClientProfile] = useState(null);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check-In Form
  const [weight, setWeight] = useState('');
  const [protein, setProtein] = useState('');
  const [water, setWater] = useState('');
  const [steps, setSteps] = useState(8000);
  const [sleep, setSleep] = useState(7.5);
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, checkInsRes] = await Promise.all([
        api.get('/client/stats/'),
        api.get('/daily-checkins/'),
      ]);
      setClientProfile(statsRes.data);
      if (statsRes.data.today_checkin) {
        setTodayCheckIn(statsRes.data.today_checkin);
      }
      setHistory(checkInsRes.data);
      if (statsRes.data.current_weight) {
        setWeight(statsRes.data.current_weight);
      }
      if (statsRes.data.diet_plan) {
        setProtein(statsRes.data.diet_plan.protein);
        setWater(statsRes.data.diet_plan.water_goal);
      }
    } catch (err) {
      console.error('Error loading checkin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/daily-checkins/', {
        client: clientProfile.client_id,
        date: today,
        weight: parseFloat(weight),
        protein: parseFloat(protein),
        water: parseFloat(water),
        steps: parseInt(steps),
        sleep: parseFloat(sleep),
        notes: notes,
      });
      setSuccess('Daily check-in submitted successfully! Keep up the momentum!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.date || err.response?.data?.detail || 'Error submitting check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-emerald-400 font-semibold">Loading Check-Ins...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h1 className="text-2xl font-extrabold text-white">Daily Progress Check-In</h1>
        <p className="text-sm text-gray-400 mt-1">Submit your daily metrics to update your trainer & keep your streak 🔥</p>
      </div>

      {todayCheckIn ? (
        <div className="bg-emerald-950/80 border border-emerald-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center space-x-3 text-emerald-400">
            <FiCheckCircle className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-white text-lg">Today's Check-In Submitted!</h3>
              <p className="text-xs text-emerald-300">You have already completed your update for today. Come back tomorrow!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">Weight</span>
              <span className="font-bold text-white text-base">{todayCheckIn.weight} kg</span>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">Protein</span>
              <span className="font-bold text-emerald-400 text-base">{todayCheckIn.protein} g</span>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">Water</span>
              <span className="font-bold text-cyan-400 text-base">{todayCheckIn.water} L</span>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">Steps</span>
              <span className="font-bold text-white text-base">{todayCheckIn.steps}</span>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-gray-400 block text-[10px]">Sleep</span>
              <span className="font-bold text-purple-400 text-base">{todayCheckIn.sleep} hrs</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-lg border-b border-gray-700 pb-3">Submit Today's Entry</h3>
          
          {error && <div className="bg-red-950 border border-red-800 text-red-300 p-3 rounded-xl text-xs">{error}</div>}
          {success && <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs">{success}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Today's Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Protein Intake (grams) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Water Intake (Liters) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Daily Steps *</label>
              <input
                type="number"
                required
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Sleep (Hours) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Optional Notes for Trainer</label>
            <textarea
              rows={3}
              placeholder="e.g. Felt great during leg day today!"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
          >
            {submitting ? 'Submitting...' : 'Submit Daily Check-In'}
          </button>
        </form>
      )}

      {/* History Log */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-bold text-white text-base">Check-In History Log</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900/60 text-xs uppercase text-gray-400 border-b border-gray-700">
            <tr>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Weight</th>
              <th className="py-3 px-4 font-semibold">Protein</th>
              <th className="py-3 px-4 font-semibold">Water</th>
              <th className="py-3 px-4 font-semibold">Steps / Sleep</th>
              <th className="py-3 px-4 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/60">
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">No past check-ins found.</td>
              </tr>
            ) : (
              history.map((h) => (
                <tr key={h.id} className="hover:bg-gray-700/30">
                  <td className="py-3 px-4 font-bold text-white">{h.date}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">{h.weight} kg</td>
                  <td className="py-3 px-4">{h.protein} g</td>
                  <td className="py-3 px-4">{h.water} L</td>
                  <td className="py-3 px-4 text-xs text-gray-400">{h.steps} steps | {h.sleep} hrs</td>
                  <td className="py-3 px-4 text-xs text-gray-300">{h.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
