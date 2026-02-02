
import React from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'শনি', score: 20 },
  { day: 'রবি', score: 35 },
  { day: 'সোম', score: 30 },
  { day: 'মঙ্গল', score: 55 },
  { day: 'বুধ', score: 70 },
  { day: 'বৃহঃ', score: 65 },
  { day: 'শুক্র', score: 90 },
];

const ProgressTracker: React.FC = () => {
  const correctCount = parseInt(localStorage.getItem('correctCount') || '0');
  
  const nextMilestone = correctCount < 1 ? 1 : correctCount < 5 ? 5 : correctCount < 10 ? 10 : 20;
  const progressPercent = Math.min((correctCount / nextMilestone) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-blue-100 space-y-6 flex flex-col h-full min-h-[350px]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-blue-600 flex items-center gap-2">
          📈 প্রগ্রেস ট্র্যাকার
        </h2>
        <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-black text-blue-600">
          সঠিক উত্তর: {correctCount}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-400 px-1">
          <span>পরবর্তী উপহার</span>
          <span>{correctCount}/{nextMilestone}</span>
        </div>
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-100 p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-center font-bold text-blue-400">
          {correctCount >= 20 ? 'তুমি সব উপহার জিতেছো! 🥕' : `আর ${nextMilestone - correctCount}টি সঠিক উত্তর দিলে উপহার মিলবে!`}
        </p>
      </div>

      {/* Fixed height and aspect ratio for Recharts container */}
      <div className="flex-grow w-full min-h-[150px] relative overflow-hidden">
        <div className="absolute inset-0">
          <ResponsiveContainer width="99%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
