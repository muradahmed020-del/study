
import React, { useState, useEffect } from 'react';
import { AppSection, Challenge } from './types';
import Mascot from './components/Mascot';
import DrawingBoard from './components/DrawingBoard';
import ProgressTracker from './components/ProgressTracker';
import AskBox from './components/AskBox';
import { generateDailyChallenge, generateLesson } from './services/geminiService';

const App: React.FC = () => {
  const [section, setSection] = useState<AppSection>(AppSection.HOME);
  const [mascotMsg, setMascotMsg] = useState('স্বাগতম বন্ধু! আজ আমরা কি শিখবো? 🐰✨');
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [stars, setStars] = useState(() => {
    const saved = localStorage.getItem('stars');
    return saved ? parseInt(saved) : 10;
  });

  useEffect(() => {
    localStorage.setItem('stars', stars.toString());
  }, [stars]);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    setLoading(true);
    try {
      const data = await generateDailyChallenge();
      setDailyChallenge(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (type: string, sectionEnum: AppSection) => {
    setSection(sectionEnum);
    setLoading(true);
    setLessonContent('');
    try {
      const content = await generateLesson(type);
      setLessonContent(content);
      const titles: Record<string, string> = { 'bangla': 'বাংলা', 'math': 'গণিত', 'history': 'দেশপ্রেম', 'science': 'বিজ্ঞান' };
      setMascotMsg(`চলো ${titles[type] || 'নতুন কিছু'} শিখি! খুব মজা হবে! ✨`);
    } catch (e) {
      setLessonContent("দুঃখিত বন্ধু, এখন গাজর খাচ্ছি! পরে চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectAnswer = () => {
    if (!showAnswer) {
      setShowAnswer(true);
      setStars(prev => prev + 5);
      setMascotMsg("সাবাস বন্ধু! তুমি অসাধারণ! ৫টি স্টার পেয়েছো! 🌟🌟🌟");
    }
  };

  const renderContent = () => {
    if (loading && section !== AppSection.HOME) {
      return (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="relative">
             <div className="w-24 h-24 border-8 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-3xl">🐰</div>
          </div>
          <p className="text-2xl font-black text-pink-600 animate-pulse">বানি তোমার জন্য যাদু তৈরি করছে...</p>
        </div>
      );
    }

    switch (section) {
      case AppSection.CHALLENGE:
        return (
          <div className="max-w-3xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-t-[12px] border-yellow-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 rotate-12">🚀</div>
              <h2 className="text-4xl font-black text-gray-800 mb-8 flex items-center gap-4">
                <span className="bg-yellow-100 p-3 rounded-2xl">🌟</span> আজকের চ্যালেঞ্জ
              </h2>
              {dailyChallenge ? (
                <div className="space-y-8">
                  <div className="bg-yellow-50 p-8 rounded-3xl text-2xl md:text-3xl text-gray-700 leading-relaxed font-bold border-2 border-yellow-100 shadow-inner text-center italic">
                    "{dailyChallenge.question}"
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={handleCorrectAnswer}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:translate-y-0"
                    >
                      উত্তর দেখো (+৫ ⭐)
                    </button>
                    <button 
                      onClick={() => setMascotMsg(`একটু সাহায্য করি? এই নাও ইঙ্গিত: ${dailyChallenge.hint}`)}
                      className="flex-1 bg-blue-50 text-blue-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-100 transition-colors"
                    >
                      ইঙ্গিত চাই 💡
                    </button>
                  </div>
                  {showAnswer && (
                    <div className="mt-8 p-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-4 border-green-200 text-3xl md:text-5xl font-black text-green-700 text-center animate-bounce shadow-xl">
                      ✅ {dailyChallenge.answer}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <button onClick={() => setSection(AppSection.HOME)} className="flex items-center gap-2 text-pink-600 font-black hover:gap-4 transition-all text-xl">
              <span>⬅️</span> হোমে ফিরে যাও
            </button>
          </div>
        );

      case AppSection.CLASSROOM:
        return (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <DrawingBoard />
            <button onClick={() => setSection(AppSection.HOME)} className="flex items-center gap-2 text-emerald-600 font-black hover:gap-4 transition-all text-xl">
              <span>⬅️</span> হোমে ফিরে যাও
            </button>
          </div>
        );

      case AppSection.LEARN_BANGLA:
      case AppSection.LEARN_MATH:
      case AppSection.LEARN_SCIENCE:
      case AppSection.LEARN_HISTORY:
        const theme = section === AppSection.LEARN_BANGLA ? 'pink' : section === AppSection.LEARN_MATH ? 'blue' : section === AppSection.LEARN_SCIENCE ? 'indigo' : 'red';
        const topicMap: Record<string, string> = {
          [AppSection.LEARN_BANGLA]: 'bangla',
          [AppSection.LEARN_MATH]: 'math',
          [AppSection.LEARN_SCIENCE]: 'science',
          [AppSection.LEARN_HISTORY]: 'history',
        };
        const currentTopic = topicMap[section] || 'bangla';

        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className={`bg-white p-10 rounded-[2.5rem] shadow-2xl border-t-[12px] border-${theme}-400`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h2 className="text-4xl font-black text-gray-800 mb-2">📖 শেখার মজা</h2>
                   <p className={`text-${theme}-600 font-bold uppercase tracking-widest`}>{section.replace('learn_', '').toUpperCase()}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-3xl text-3xl animate-pulse">🎁</div>
              </div>
              <div className="prose prose-xl prose-indigo max-w-none text-gray-700 whitespace-pre-wrap font-medium leading-relaxed bg-gray-50/50 p-8 rounded-3xl border border-gray-100 italic">
                {lessonContent || "এখানে চমৎকার কিছু লোড হচ্ছে বন্ধু..."}
              </div>
              <div className="mt-10 flex flex-wrap gap-6">
                 <button onClick={() => setSection(AppSection.HOME)} className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-colors">⬅️ হোম</button>
                 <button 
                  onClick={() => startLesson(currentTopic, section)} 
                  className={`flex-1 bg-${theme}-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:brightness-110 transition-all`}
                 >
                   আরেকটি নতুন গল্প দেখাও ✨
                 </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-[fadeIn_0.5s_ease-out]">
            <div className="lg:col-span-7 space-y-10">
              {/* Main Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className="group bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-[2rem] shadow-xl cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden" 
                  onClick={() => setSection(AppSection.CHALLENGE)}
                >
                  <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 group-hover:scale-125 transition-transform">🚀</div>
                  <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm">🏆</div>
                  <h3 className="text-3xl font-black text-white mb-2">আজকের চ্যালেঞ্জ</h3>
                  <p className="text-white/80 font-bold">প্রতিদিন নতুন ধাঁধা খেলে জিতে নাও স্টার!</p>
                </div>

                <div 
                  className="group bg-gradient-to-br from-emerald-400 to-teal-600 p-8 rounded-[2rem] shadow-xl cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden" 
                  onClick={() => setSection(AppSection.CLASSROOM)}
                >
                  <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 group-hover:scale-125 transition-transform">🎨</div>
                  <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm">🌈</div>
                  <h3 className="text-3xl font-black text-white mb-2">জাদুর বোর্ড</h3>
                  <p className="text-white/80 font-bold">তোমার জাদুর পেন্সিল দিয়ে নতুন কিছু আঁকো!</p>
                </div>
              </div>

              {/* Learning Modules Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button onClick={() => startLesson('bangla', AppSection.LEARN_BANGLA)} className="bg-pink-50 p-6 rounded-[2rem] border-4 border-pink-100 hover:border-pink-300 hover:bg-pink-100 transition-all group">
                   <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">👅</div>
                   <div className="font-black text-pink-700 text-lg">বাংলা মজা</div>
                </button>
                <button onClick={() => startLesson('math', AppSection.LEARN_MATH)} className="bg-blue-50 p-6 rounded-[2rem] border-4 border-blue-100 hover:border-blue-300 hover:bg-blue-100 transition-all group">
                   <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">🔢</div>
                   <div className="font-black text-blue-700 text-lg">গণিত জাদু</div>
                </button>
                <button onClick={() => startLesson('science', AppSection.LEARN_SCIENCE)} className="bg-indigo-50 p-6 rounded-[2rem] border-4 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100 transition-all group">
                   <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">🧪</div>
                   <div className="font-black text-indigo-700 text-lg">ছোট বিজ্ঞানী</div>
                </button>
                <button onClick={() => startLesson('history', AppSection.LEARN_HISTORY)} className="bg-red-50 p-6 rounded-[2rem] border-4 border-red-100 hover:border-red-300 hover:bg-red-100 transition-all group">
                   <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">🇧🇩</div>
                   <div className="font-black text-red-700 text-lg">দেশপ্রেম</div>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-10">
              <ProgressTracker />
              <AskBox />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 max-w-7xl mx-auto pt-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 glass-morphism p-5 rounded-[2.5rem] shadow-xl sticky top-6 z-50 border-2 border-white/50">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setSection(AppSection.HOME)}>
          <div className="bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 w-16 h-16 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg transform group-hover:rotate-6 transition-all">শ</div>
          <div className="hidden sm:block">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-600">শিশুদের শিক্ষালয়</h1>
            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Learn with Bunny 🐰</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-yellow-400/20 px-6 py-3 rounded-2xl border-2 border-yellow-400 shadow-inner group">
             <span className="text-2xl animate-pulse">⭐</span>
             <span className="text-yellow-700 font-black text-2xl">{stars}</span>
          </div>
          <button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-2xl text-lg font-black shadow-lg hover:brightness-110 hover:-translate-y-1 transition-all active:translate-y-0">উপহার 🎁</button>
        </div>
      </header>

      {/* Mascot Section */}
      <div className="mb-14">
        <Mascot message={mascotMsg} />
      </div>

      <main>
        {renderContent()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-morphism border-2 border-white/50 px-10 py-4 rounded-[2.5rem] flex gap-12 shadow-2xl z-50">
        <button onClick={() => setSection(AppSection.HOME)} className={`flex flex-col items-center group ${section === AppSection.HOME ? 'text-purple-600' : 'text-gray-400'}`}>
          <span className={`text-3xl mb-1 transition-transform group-hover:scale-125 ${section === AppSection.HOME ? 'scale-110' : ''}`}>🏠</span>
          <span className="text-[12px] font-black">হোম</span>
        </button>
        <button onClick={() => setSection(AppSection.CHALLENGE)} className={`flex flex-col items-center group ${section === AppSection.CHALLENGE ? 'text-orange-500' : 'text-gray-400'}`}>
          <span className={`text-3xl mb-1 transition-transform group-hover:scale-125 ${section === AppSection.CHALLENGE ? 'scale-110' : ''}`}>🚀</span>
          <span className="text-[12px] font-black">চ্যালেঞ্জ</span>
        </button>
        <button onClick={() => setSection(AppSection.CLASSROOM)} className={`flex flex-col items-center group ${section === AppSection.CLASSROOM ? 'text-emerald-500' : 'text-gray-400'}`}>
          <span className={`text-3xl mb-1 transition-transform group-hover:scale-125 ${section === AppSection.CLASSROOM ? 'scale-110' : ''}`}>🎨</span>
          <span className="text-[12px] font-black">জাদুর বোর্ড</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
