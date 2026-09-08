import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { FiTrendingDown, FiCheckCircle, FiAward, FiCalendar } from 'react-icons/fi';

export const MyProgress = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chRes, repRes] = await Promise.all([
        api.get('/daily-checkins/'),
        api.get('/reports/weekly/'),
      ]);
      setCheckIns(chRes.data);
      setReport(repRes.data);
    } catch (err) {
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = checkIns
    .slice()
    .reverse()
    .map((c) => ({
      date: c.date,
      weight: c.weight,
      protein: c.protein,
      targetProtein: report?.target_protein_g || 150,
    }));

  if (loading) {
    return <div className="p-8 text-emerald-400 font-semibold">Loading Progress Analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h1 className="text-2xl font-extrabold text-white">My Fitness Analytics & Progress</h1>
        <p className="text-sm text-gray-400 mt-1">Visual charts tracking weight progression, protein intake & consistency</p>
      </div>

      {/* Generated Weekly Progress Report Card */}
      {report && (
        <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-emerald-950 border border-emerald-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <h3 className="font-extrabold text-white text-lg flex items-center">
              <FiAward className="mr-2 text-emerald-400" /> Weekly Summary Report
            </h3>
            <span className="text-xs font-mono text-emerald-300 font-bold">{report.report_period}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Weight Change</span>
              <p className="text-lg font-extrabold text-white mt-1">
                {report.weight_change > 0 ? `+${report.weight_change}` : report.weight_change} kg
              </p>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Workout %</span>
              <p className="text-lg font-extrabold text-emerald-400 mt-1">{report.workout_completion_pct}%</p>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Protein Goal %</span>
              <p className="text-lg font-extrabold text-emerald-400 mt-1">{report.protein_achievement_pct}%</p>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Check-In Consistency</span>
              <p className="text-lg font-extrabold text-emerald-400 mt-1">{report.checkin_consistency_pct}%</p>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Streak</span>
              <p className="text-lg font-extrabold text-amber-400 mt-1">🔥 {report.current_streak} days</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progression Chart */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-base">Weight Progress (Date vs Weight)</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No check-in data recorded yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#FFF' }} />
                  <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Protein Target vs Actual Chart */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-base">Protein Intake vs Target</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No protein intake data available.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#FFF' }} />
                  <Legend />
                  <Bar dataKey="protein" fill="#10B981" name="Actual Protein (g)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="targetProtein" fill="#3B82F6" name="Target Protein (g)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
