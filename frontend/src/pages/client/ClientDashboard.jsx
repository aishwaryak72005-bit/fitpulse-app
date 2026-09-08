import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Confetti from 'react-confetti';
import {
  FiZap, FiCheckCircle, FiClock, FiActivity, FiPieChart,
  FiAward, FiAlertCircle, FiArrowRight
} from 'react-icons/fi';

export const ClientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchClientStats();
  }, []);

  const fetchClientStats = async () => {
    try {
      const res = await api.get('/client/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching client stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      await api.post('/workout-completion/', { completed: true });
      setShowConfetti(true);
      fetchClientStats();
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      alert('Error marking workout completed');
    }
  };

  if (loading) {
    return <div className="p-8 text-emerald-400 font-semibold">Loading Client Dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-red-400">Failed to load profile statistics.</div>;
  }

  const weightProgressPct = Math.min(
    100,
    Math.max(
      0,
      ((stats.starting_weight - stats.current_weight) /
        Math.max(0.1, stats.starting_weight - stats.goal_weight)) *
        100
    )
  );

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}

      {/* Motivation Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-gray-800 to-gray-800 border border-emerald-800/60 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Daily Motivation</span>
          <h1 className="text-2xl font-extrabold text-white mt-1">"Every workout brings you closer to your goal."</h1>
          <p className="text-xs text-gray-400 mt-1">Scheduled Workout Time: <span className="font-mono text-emerald-400 font-bold">{stats.workout_time}</span></p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-gray-900/80 px-4 py-3 rounded-2xl border border-emerald-700/50 shadow-inner">
          <FiZap className="w-8 h-8 text-amber-500 animate-bounce mr-3" />
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current Streak</span>
            <div className="text-xl font-extrabold text-amber-400">{stats.streak} Days 🔥</div>
          </div>
        </div>
      </div>

      {/* Main Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Workout Card */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <div className="flex items-center space-x-2">
              <FiActivity className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Today's Workout Session</h3>
            </div>
            {stats.workout_completed ? (
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-full flex items-center">
                <FiCheckCircle className="mr-1" /> Completed
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold rounded-full">
                {stats.todays_workouts_count} Exercises Pending
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400">
            {stats.workout_completed
              ? "Awesome job! You've crushed today's workout. Keep up the momentum!"
              : `You have ${stats.todays_workouts_count} exercises assigned for today.`}
          </p>

          <div className="flex items-center space-x-3 pt-2">
            {!stats.workout_completed && (
              <button
                onClick={handleCompleteWorkout}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/40 flex items-center justify-center"
              >
                <FiCheckCircle className="mr-2" /> Mark Workout Completed 🎉
              </button>
            )}
            <Link
              to="/client/workouts"
              className="py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold rounded-xl text-sm transition flex items-center"
            >
              View Exercises <FiArrowRight className="ml-1" />
            </Link>
          </div>
        </div>

        {/* Today's Daily Check-In Card */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Daily Check-In Update</h3>
            </div>
            {stats.checkin_completed ? (
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-full">
                🟢 Submitted Today
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold rounded-full">
                🟡 Pending Today
              </span>
            )}
          </div>

          {stats.today_checkin ? (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-gray-900 p-2 rounded-xl border border-gray-700">
                <span className="text-gray-400 block text-[10px]">Weight</span>
                <span className="font-bold text-white text-sm">{stats.today_checkin.weight} kg</span>
              </div>
              <div className="bg-gray-900 p-2 rounded-xl border border-gray-700">
                <span className="text-gray-400 block text-[10px]">Protein</span>
                <span className="font-bold text-emerald-400 text-sm">{stats.today_checkin.protein} g</span>
              </div>
              <div className="bg-gray-900 p-2 rounded-xl border border-gray-700">
                <span className="text-gray-400 block text-[10px]">Water</span>
                <span className="font-bold text-blue-400 text-sm">{stats.today_checkin.water} L</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Submit your weight, protein intake, water intake, steps and sleep hours to maintain your streak.
            </p>
          )}

          <div className="pt-2">
            <Link
              to="/client/checkin"
              className="w-full block text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/40"
            >
              {stats.checkin_completed ? 'View Check-In History' : 'Submit Today\'s Check-In'}
            </Link>
          </div>
        </div>
      </div>

      {/* Target Weight Progress Card */}
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white text-base">Goal Weight Journey</h3>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {stats.current_weight} kg / {stats.goal_weight} kg
          </span>
        </div>
        <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden border border-gray-700 p-0.5">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(5, weightProgressPct)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Start: {stats.starting_weight} kg</span>
          <span>Current: {stats.current_weight} kg</span>
          <span>Target: {stats.goal_weight} kg</span>
        </div>
      </div>

      {/* Macro Diet Summary */}
      {stats.diet_plan && (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <h3 className="font-bold text-white text-base">Target Daily Macro Plan</h3>
            <Link to="/client/diet" className="text-xs font-bold text-emerald-400 hover:underline">
              Full Diet Plan →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Calories</span>
              <p className="text-base font-extrabold text-amber-400 mt-1">{stats.diet_plan.calories} kcal</p>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Protein</span>
              <p className="text-base font-extrabold text-emerald-400 mt-1">{stats.diet_plan.protein} g</p>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Carbs</span>
              <p className="text-base font-extrabold text-blue-400 mt-1">{stats.diet_plan.carbs} g</p>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Fats</span>
              <p className="text-base font-extrabold text-purple-400 mt-1">{stats.diet_plan.fats} g</p>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Water</span>
              <p className="text-base font-extrabold text-cyan-400 mt-1">{stats.diet_plan.water_goal} L</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
