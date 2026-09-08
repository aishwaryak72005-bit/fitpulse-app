import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Confetti from 'react-confetti';
import { FiCheckCircle, FiActivity, FiCalendar } from 'react-icons/fi';

export const MyWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  );
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    checkCompletion();
  }, [selectedDay]);

  const fetchWorkouts = async () => {
    try {
      const res = await api.get('/workout-plans/');
      setWorkouts(res.data);
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCompletion = async () => {
    try {
      const res = await api.get('/workout-completion/');
      setCompleted(res.data.completed);
    } catch (err) {
      console.error('Error checking completion:', err);
    }
  };

  const handleToggleCompletion = async () => {
    try {
      const newStatus = !completed;
      await api.post('/workout-completion/', { completed: newStatus });
      setCompleted(newStatus);
      if (newStatus) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (err) {
      alert('Error updating completion status');
    }
  };

  const currentWorkouts = workouts.filter((w) => w.day === selectedDay);

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}

      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Workout Routine</h1>
          <p className="text-sm text-gray-400 mt-1">Assigned exercise plans for each day of the week</p>
        </div>
        {selectedDay === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && (
          <button
            onClick={handleToggleCompletion}
            className={`mt-4 md:mt-0 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg flex items-center ${
              completed
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-emerald-950/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            <FiCheckCircle className="mr-2 w-5 h-5" />
            {completed ? '🎉 Today\'s Session Completed!' : 'Mark Today\'s Session Completed'}
          </button>
        )}
      </div>

      {/* Day Selector Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-gray-700">
        {daysOfWeek.map((day) => {
          const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' });
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              <span>{day}</span>
              {isToday && <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-800">TODAY</span>}
            </button>
          );
        })}
      </div>

      {/* Exercise List for Selected Day */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="font-bold text-white text-lg">{selectedDay} Exercises</h3>
          <span className="text-xs text-gray-400 font-semibold">{currentWorkouts.length} Exercises Scheduled</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-emerald-400">Loading workouts...</div>
        ) : currentWorkouts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 space-y-2">
            <FiActivity className="w-10 h-10 mx-auto text-gray-600" />
            <p className="font-semibold text-gray-300">Rest Day!</p>
            <p className="text-xs text-gray-500">No exercises assigned for {selectedDay}. Focus on recovery and nutrition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentWorkouts.map((w, idx) => (
              <div
                key={w.id}
                className="bg-gray-900/80 border border-gray-700 p-4 rounded-xl space-y-2 flex justify-between items-start"
              >
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Exercise #{idx + 1}</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{w.exercise_name}</h4>
                  <div className="flex items-center space-x-3 text-xs text-gray-300 mt-2 font-medium">
                    <span className="bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700">{w.sets} Sets</span>
                    <span className="bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700">{w.reps} Reps</span>
                  </div>
                  {w.notes && <p className="text-xs text-gray-400 italic mt-2">Note: {w.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
