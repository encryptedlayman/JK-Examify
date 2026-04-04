import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';
import { BookOpen, Zap, Trophy, Clock, CheckCircle, ArrowLeft, Play, Star, Award, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMCQsByTopic } from '../services/geminiService';
import { MCQ } from '../types';
import { cn } from '../lib/utils';

export default function Topic() {
  const { topicId } = useParams();
  const decodedTopic = decodeURIComponent(topicId || '');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);

  const category = CATEGORIES.find(c => c.topics.includes(decodedTopic));

  useEffect(() => {
    async function loadMCQs() {
      setLoading(true);
      try {
        const data = await getMCQsByTopic(decodedTopic, 10);
        setMcqs(data);
      } catch (error) {
        console.error('Error loading MCQs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMCQs();
  }, [decodedTopic]);

  const startTest = (mode: string) => {
    navigate(`/test/${encodeURIComponent(decodedTopic)}?mode=${mode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-4">
        <Link to="/categories" className="inline-flex items-center space-x-2 text-blue-600 font-bold hover:translate-x-[-4px] transition-transform">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Topics</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>{category?.name}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {decodedTopic}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-bold text-slate-700">4.9/5.0</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-700">12K+ Attempts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Topic Overview */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
            <h2 className="text-2xl font-black text-slate-900">Topic Overview</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              This topic is crucial for both JKSSB and SSC exams. Our comprehensive question bank covers all aspects of {decodedTopic}, ranging from basic concepts to advanced problem-solving techniques.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Total Questions', value: '5000+', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
                { title: 'Difficulty', value: 'Mixed (E/M/H)', icon: BarChart3, color: 'bg-orange-50 text-orange-600' },
                { title: 'Avg. Time', value: '45s / Question', icon: Clock, color: 'bg-green-50 text-green-600' },
                { title: 'Exam Relevance', value: 'High (JKSSB/SSC)', icon: Award, color: 'bg-purple-50 text-purple-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.title}</div>
                    <div className="text-lg font-black text-slate-900">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Practice Modes */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-slate-900">Practice Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  id: 'practice',
                  title: 'Practice Mode',
                  desc: 'Untimed session with instant feedback and detailed explanations for every question.',
                  icon: Zap,
                  color: 'blue',
                  cta: 'Start Practice'
                },
                {
                  id: 'mock',
                  title: 'Mock Test',
                  desc: 'Timed exam-style simulation. Get your score and performance analysis at the end.',
                  icon: Trophy,
                  color: 'indigo',
                  cta: 'Take Mock Test'
                }
              ].map((mode) => (
                <motion.div
                  key={mode.id}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all space-y-6 flex flex-col",
                    mode.color === 'blue' ? "hover:border-blue-500/30" : "hover:border-indigo-500/30"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                    mode.color === 'blue' ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"
                  )}>
                    <mode.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{mode.title}</h3>
                  <p className="text-slate-500 flex-grow">{mode.desc}</p>
                  <button
                    onClick={() => startTest(mode.id)}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2",
                      mode.color === 'blue' ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                    )}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{mode.cta}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Progress Card */}
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold">Your Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mastery Level</span>
                  <span className="text-blue-400 font-bold">45%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
                  <div className="text-xl font-bold">124</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Solved</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
                  <div className="text-xl font-bold">88%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Top Performers</h3>
            <div className="space-y-4">
              {[
                { name: 'Aamir Khan', score: '2450 XP', rank: 1, color: 'text-yellow-500' },
                { name: 'Sonia Sharma', score: '2210 XP', rank: 2, color: 'text-slate-400' },
                { name: 'Rahul Dev', score: '1980 XP', rank: 3, color: 'text-orange-500' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm", user.color, "bg-slate-50")}>
                      #{user.rank}
                    </div>
                    <div className="font-bold text-slate-700 text-sm">{user.name}</div>
                  </div>
                  <div className="text-xs font-black text-blue-600">{user.score}</div>
                </div>
              ))}
            </div>
            <Link to="/leaderboard" className="block text-center text-blue-600 font-bold text-sm hover:underline">
              View Global Leaderboard
            </Link>
          </div>

          {/* Exam Tips */}
          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 space-y-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-lg font-bold text-blue-900">Exam Tip</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Focus on previous year questions (PYQs) for {decodedTopic}. JKSSB often repeats themes from SSC exams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
