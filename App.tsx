
import React, { useState, useEffect } from 'react';
import { AppSection, Challenge, Gift } from './types';
import Mascot from './components/Mascot';
import DrawingBoard from './components/DrawingBoard';
import ProgressTracker from './components/ProgressTracker';
import AskBox from './components/AskBox';
import { generateDailyChallenge, generateLesson } from './services/geminiService';

const INITIAL_GIFTS: Gift[] = [
  { id: '1', name: 'নতুন বন্ধু', emoji: '🐣', requiredCorrect: 1, unlocked: false, description: 'প্রথম সঠিক উত্তর!' },
  { id: '2', name: 'রুপার ট্রফি', emoji: '🥈', requiredCorrect: 5, unlocked: false, description: '৫টি উত্তর সঠিক!' },
  { id: '3', name: 'গোল্ডেন গাজর', emoji: '🥕', requiredCorrect: 10, unlocked: false, description: '১০টি উত্তর সঠিক! তুমি বস!' },
  { id: '4', name: 'সুপার ব্রেইন', emoji: '🧠', requiredCorrect: 15, unlocked: false, description: 'অসাধারণ মেধা!' },
  { id: '5', name: 'ম্যাজিক মুকুট', emoji: '👑', requiredCorrect: 20, unlocked: false, description: 'তুমি শিক্ষার রাজা!' },
];

const LOADING_MESSAGES = [
  "বানি যাদুর থলে থেকে চ্যালেঞ্জ খুঁজছে... 🥕",
  "গাজর চিবুতে চিবুতে বানি তোমার জন্য ভাবছে... 🐰",
  "বানি মহাকাশ থেকে তথ্য আনছে... 🚀",
  "বানি বইয়ের পাতা উল্টাচ্ছে... 📖",
  "একটু ধৈর্য ধরো বন্ধু, বানি প্রায় চলে এসেছে! ✨"
];

const App: React.FC = () => {
  const [section, setSection] = useState<AppSection>(AppSection.HOME);
  const [mascotMsg, setMascotMsg] = useState('স্বাগতম বন্ধু! আজ আমরা কি শিখবো? 🐰✨');
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [newGift, setNewGift] = useState<Gift | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [stars, setStars] = useState(() => parseInt(localStorage.getItem('stars') || '0'));
  const [correctCount, setCorrectCount] = useState(() => parseInt(localStorage.getItem('correctCount') || '0'));
  const [unlockedGifts, setUnlockedGifts] = useState<string[]>(() => JSON.parse(localStorage.getItem('unlockedGifts') || '[]'));

  useEffect(() => {
    localStorage.setItem('stars', stars.toString());
    localStorage.setItem('correctCount', correctCount.toString());
    localStorage.setItem('unlockedGifts', JSON.stringify(unlockedGifts));
  }, [stars, correctCount, unlockedGifts]);

  useEffect(() => {
    if (section === AppSection.HOME && !dailyChallenge) {
      loadChallenge();
    }
  }, [section]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateDailyChallenge();
      setDailyChallenge(data);
      setShowAnswer(false);
    } catch (e) {
      console.error(e);
      setError("চ্যালেঞ্জ লোড করতে সমস্যা হচ্ছে। তোমার ইন্টারনেট বা API কী চেক করো।");
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectAnswer = () => {
    if (!showAnswer) {
      setShowAnswer(true);
      const newScore = stars + 10;
      const newCount = correctCount + 1;
      setStars(newScore);
      setCorrectCount(newCount);
      
      const giftToUnlock = INITIAL_GIFTS.find(g => g.requiredCorrect === newCount && !unlockedGifts.includes(g.id));
      if (giftToUnlock) {
        setUnlockedGifts(prev => [...prev, giftToUnlock.id]);
        setNewGift(giftToUnlock);
      } else {
        setMascotMsg("সাবাস বন্ধু! সঠিক উত্তর হয়েছে! 🌟");
      }
    }
  };

  const startLesson = async (type: string, sectionEnum: AppSection) => {
    setSection(sectionEnum);
    setLoading(true);
    setLessonContent('');
    setError(null);
    try {
      const content = await generateLesson(type);
      setLessonContent(content);
      setMascotMsg("চলো নতুন কিছু শিখি! 🐰");
    } catch (e) {
      setError("গল্পটি লোড করা যাচ্ছে না। 🥕");
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    if (loading && section !== AppSection.HOME) {
      return (
        <div className="flex flex-col items-center justify-center py-24 animate-pulse">
          <div className="w-20 h-20 border-8 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-8"></div>
          <p className="text-2xl font-black text-pink-600 text-center px-4 max-w-md">
            {LOADING_MESSAGES[loadingMsgIdx]}
          </p>
        </div>
      );
    }

    if (section === AppSection.CHALLENGE) {
      return (
        <div className="max-w-3xl mx-auto animate-pop space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-t-[12px] border-yellow-400">
            <h2 className="text-4xl font-black text-gray-800 mb-8 flex items-center gap-4">
              <span className="bg-yellow-100 p-3 rounded-2xl">🌟</span> আজকের চ্যালেঞ্জ
            </h2>
            {dailyChallenge ? (
              <div className="space-y-8">
                <div className="bg-yellow-50 p-8 rounded-3xl text-2xl text-gray-700 leading-relaxed font-bold border-2 border-yellow-100 text-center italic">
                  "{dailyChallenge.question}"
                </div>
                {!showAnswer ? (
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button onClick={handleCorrectAnswer} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:-translate-y-1 transition-all">
                      উত্তর দেখো (+১০ ⭐)
                    </button>
                    <button onClick={() => setMascotMsg(`ইঙ্গিত: ${dailyChallenge.hint}`)} className="flex-1 bg-blue-50 text-blue-600 py-5 rounded-2xl font-black text-xl">
                      ইঙ্গিত চাই 💡
                    </button>
                  </div>
                ) : (
                  <div className="text-center animate-bounce">
                    <p className="text-5xl font-black text-green-600">✅ {dailyChallenge.answer}</p>
                  </div>
                )}
                <button onClick={loadChallenge} className="w-full text-gray-400 font-bold hover:text-gray-600">আরেকটি নতুন চ্যালেঞ্জ চাই? 🔄</button>
              </div>
            ) : <p className="text-red-500">{error || "কিছু একটা ভুল হয়েছে!"}</p>}
          </div>
          <button onClick={() => setSection(AppSection.HOME)} className="text-pink-600 font-black text-xl flex items-center gap-2">⬅️ ফিরে যাও</button>
        </div>
      );
    }

    if (section === AppSection.CLASSROOM) {
      return (
        <div className="space-y-8 animate-pop">
          <DrawingBoard />
          <button onClick={() => setSection(AppSection.HOME)} className="text-emerald-600 font-black text-xl flex items-center gap-2">⬅️ ফিরে যাও</button>
        </div>
      );
    }

    if (section === AppSection.COLLECTION) {
      return (
        <div className="max-w-4xl mx-auto animate-pop bg-white p-10 rounded-[3rem] shadow-2xl border-t-[12px] border-purple-400">
          <h2 className="text-4xl font-black text-gray-800 mb-10 flex items-center gap-4">
            <span className="bg-purple-100 p-3 rounded-2xl">🎁</span> আমার উপহার
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {INITIAL_GIFTS.map(gift => (
              <div key={gift.id} className={`p-8 rounded-[2rem] border-4 text-center ${unlockedGifts.includes(gift.id) ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                <div className="text-7xl mb-4">{unlockedGifts.includes(gift.id) ? gift.emoji : '🔒'}</div>
                <h4 className="font-black text-gray-800">{unlockedGifts.includes(gift.id) ? gift.name : 'অজানা'}</h4>
                <p className="text-xs text-gray-500">{gift.requiredCorrect}টি উত্তর প্রয়োজন</p>
              </div>
            ))}
          </div>
          <button onClick={() => setSection(AppSection.HOME)} className="mt-12 w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-2xl">ফিরে যাও 🏠</button>
        </div>
      );
    }

    if (lessonContent) {
      return (
        <div className="max-w-4xl mx-auto animate-pop bg-white p-10 rounded-[2.5rem] shadow-2xl border-t-[12px] border-pink-400">
           <h2 className="text-3xl font-black text-gray-800 mb-6">শিখি ও জানি 📖</h2>
           <div className="prose prose-xl max-w-none text-gray-700 whitespace-pre-wrap font-medium leading-relaxed bg-gray-50 p-8 rounded-3xl italic">
             {lessonContent}
           </div>
           <button onClick={() => { setSection(AppSection.HOME); setLessonContent(''); }} className="mt-10 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-lg">ফিরে যাও</button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-[2rem] shadow-xl cursor-pointer hover:scale-105 transition-all" onClick={() => setSection(AppSection.CHALLENGE)}>
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-3xl font-black text-white">চ্যালেঞ্জ</h3>
            </div>
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-8 rounded-[2rem] shadow-xl cursor-pointer hover:scale-105 transition-all" onClick={() => setSection(AppSection.CLASSROOM)}>
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-3xl font-black text-white">জাদুর বোর্ড</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: 'bangla', icon: '👅' }, { id: 'math', icon: '🔢' }, 
              { id: 'english', icon: '🔤' }, { id: 'science', icon: '🧪' }, 
              { id: 'space', icon: '🚀' }, { id: 'animals', icon: '🦁' }, 
              { id: 'history', icon: '🇧🇩' }, { id: 'moral', icon: '🤝' }
            ].map(t => (
              <button key={t.id} onClick={() => startLesson(t.id, `learn_${t.id}` as AppSection)} className="bg-white p-5 rounded-3xl border-4 border-gray-100 hover:border-pink-300 shadow-sm font-black text-gray-700 capitalize flex flex-col items-center gap-2 group">
                <span className="text-3xl group-hover:scale-125 transition-transform">{t.icon}</span>
                <span className="text-xs">{t.id} মজা</span>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-10">
          <ProgressTracker />
          <AskBox />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 max-w-7xl mx-auto pt-8">
      {newGift && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md animate-pop">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full text-center shadow-2xl border-8 border-yellow-400">
             <div className="text-9xl mb-8 animate-bounce">{newGift.emoji}</div>
             <h2 className="text-4xl font-black text-gray-800 mb-4">অভিনন্দন! 🎉</h2>
             <p className="text-xl font-bold text-gray-600 mb-10 italic">"{newGift.name}" জিতেছো!</p>
             <button onClick={() => setNewGift(null)} className="w-full bg-yellow-400 text-white py-5 rounded-2xl font-black text-2xl">ধন্যবাদ বানি! 🐰</button>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between mb-12 glass-morphism p-5 rounded-[2.5rem] shadow-xl sticky top-6 z-50">
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setSection(AppSection.HOME)}>
          <div className="bg-pink-500 w-16 h-16 rounded-3xl flex items-center justify-center text-white text-3xl font-black">শ</div>
          <h1 className="hidden sm:block text-2xl font-black text-gray-800">শিশুদের শিক্ষালয়</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setSection(AppSection.COLLECTION)} className="bg-purple-500 text-white px-4 py-2 rounded-xl font-black text-xs sm:text-base">🎁 উপহার</button>
          <div className="bg-yellow-400/20 px-6 py-3 rounded-2xl border-2 border-yellow-400 flex items-center gap-2">
             <span className="text-xl">⭐</span>
             <span className="text-yellow-700 font-black text-2xl">{stars}</span>
          </div>
        </div>
      </header>

      <Mascot message={error || mascotMsg} />

      <main>{renderSection()}</main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-morphism px-10 py-4 rounded-[2.5rem] flex gap-12 shadow-2xl z-50">
        <button onClick={() => setSection(AppSection.HOME)} className={`text-3xl ${section === AppSection.HOME ? 'text-pink-500 scale-125' : 'text-gray-400'}`}>🏠</button>
        <button onClick={() => setSection(AppSection.CHALLENGE)} className={`text-3xl ${section === AppSection.CHALLENGE ? 'text-pink-500 scale-125' : 'text-gray-400'}`}>🚀</button>
        <button onClick={() => setSection(AppSection.COLLECTION)} className={`text-3xl ${section === AppSection.COLLECTION ? 'text-pink-500 scale-125' : 'text-gray-400'}`}>🎁</button>
      </nav>
    </div>
  );
};

export default App;
