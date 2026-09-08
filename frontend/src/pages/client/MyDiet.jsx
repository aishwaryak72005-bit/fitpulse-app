import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiPieChart, FiDownload, FiFileText, FiDroplet, FiZap } from 'react-icons/fi';

export const MyDiet = () => {
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDietPlan();
  }, []);

  const fetchDietPlan = async () => {
    try {
      const res = await api.get('/diet-plans/');
      if (res.data.length > 0) {
        setDiet(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching diet plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-emerald-400 font-semibold">Loading Diet Plan...</div>;
  }

  if (!diet) {
    return <div className="p-8 text-gray-400">No diet plan assigned by trainer yet.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h1 className="text-2xl font-extrabold text-white">My Diet & Macro Nutrition Plan</h1>
        <p className="text-sm text-gray-400 mt-1">Prescribed daily caloric and macronutrient targets</p>
      </div>

      {/* Macro Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl text-center space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase">Calories</span>
          <p className="text-2xl font-extrabold text-amber-400">{diet.calories}</p>
          <span className="text-[10px] text-gray-500 block">kcal / day</span>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl text-center space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase">Protein</span>
          <p className="text-2xl font-extrabold text-emerald-400">{diet.protein}g</p>
          <span className="text-[10px] text-gray-500 block">target daily</span>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl text-center space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase">Carbohydrates</span>
          <p className="text-2xl font-extrabold text-blue-400">{diet.carbs}g</p>
          <span className="text-[10px] text-gray-500 block">target daily</span>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl text-center space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase">Fats</span>
          <p className="text-2xl font-extrabold text-purple-400">{diet.fats}g</p>
          <span className="text-[10px] text-gray-500 block">target daily</span>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl text-center space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase">Water Goal</span>
          <p className="text-2xl font-extrabold text-cyan-400">{diet.water_goal}L</p>
          <span className="text-[10px] text-gray-500 block">hydration daily</span>
        </div>
      </div>

      {/* PDF Diet Plan Download Section */}
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <div className="flex items-center space-x-2">
            <FiFileText className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Custom PDF Diet Plan Document</h3>
          </div>
        </div>

        {diet.pdf_file ? (
          <div className="flex items-center justify-between bg-gray-900/80 p-4 rounded-xl border border-gray-700">
            <div>
              <p className="font-bold text-white text-sm">Trainer Prescribed PDF Diet Sheet</p>
              <p className="text-xs text-gray-400 mt-0.5">Uploaded specifically for your goal</p>
            </div>
            <a
              href={diet.pdf_file}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center shadow-lg shadow-emerald-900/30"
            >
              <FiDownload className="mr-2" /> Download PDF
            </a>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No PDF document attached. Follow the macro target breakdown above.</p>
        )}
      </div>
    </div>
  );
};
