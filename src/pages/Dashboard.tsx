import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { TestResult, UserProfile } from '../types';
import { motion } from 'motion/react';
import { LayoutDashboard, Trophy, Zap, Award, BarChart3, Clock, CheckCircle, TrendingUp, BookOpen, Star, Calendar, ArrowRight, ChevronRight, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        // Load Profile
        const userRef = doc(db, 'users', user!.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        }

        // Load Results
        const resultsRef = collection(db, 'testResults');
        const q = query(
          resultsRef,
          where('userId', '==', user!.uid),
          orderBy('completedAt', 'desc'),
          limit(10)
        );
        const resultsSnap = await getDocs(q);
        setResults(resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult)));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const avgAccuracy = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / results.length) 
    : 0;

  const totalTests = results.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
        <div className="flex items-center space-x-6 relative z-10">
          <div className="relative">
            <img
              src={user?.photoURL || ''}
              alt={user?.displayName || ''}
              className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900">{user?.displayName}</h1>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
                {profile?.rank || 'Beginner'}
              </span>
              <span className="text-slate-400 text-sm font-medium flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined April 2026</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-8 relative z-10">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600">{profile?.xp || 0}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total XP</div>
          </div>
          <div className="h-12 w-px bg-slate-100" />
          <div className="text-center">
            <div className="text-3xl font-black text-yellow-600">{profile?.streak || 0}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Day Streak</div>
          </div>
          <div className="h-12 w-px bg-slate-100" />
          <div className="text-center">
            <div className="text-3xl font-black text-green-600">{totalTests}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tests Taken</div>
          </div>
        </div>
      </div>

      {/* Vercel Setup Guide (Only visible in dev or if config is missing) */}
      {(!import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.DEV) && (
        <section className="bg-orange-50 border-2 border-orange-200 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center space-x-3 text-orange-600">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-xl font-bold">Vercel Deployment Guide</h3>
          </div>
          <p className="text-orange-700 text-sm">
            To make this app work on Vercel, you must add your Firebase credentials to the Vercel Dashboard.
            Copy the values from <code className="bg-orange-100 px-1 rounded">firebase-applet-config.json</code>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'VITE_FIREBASE_API_KEY',
              'VITE_FIREBASE_AUTH_DOMAIN',
              'VITE_FIREBASE_PROJECT_ID',
              'VITE_FIREBASE_STORAGE_BUCKET',
              'VITE_FIREBASE_MESSAGING_SENDER_ID',
              'VITE_FIREBASE_APP_ID',
              'VITE_FIREBASE_FIRESTORE_DATABASE_ID'
            ].map(key => (
              <div key={key} className="bg-white p-3 rounded-xl border border-orange-100 flex items-center justify-between group">
                <code className="text-[10px] font-bold text-slate-500">{key}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(key)}
                  className="text-orange-600 hover:text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <a 
              href="https://vercel.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
            >
              <span>Open Vercel Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <span>Performance Overview</span>
              </h2>
              <div className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">View Detailed Analytics</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-green-600 font-bold text-sm">+12% from last week</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black text-slate-900">{avgAccuracy}%</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Average Accuracy</div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${avgAccuracy}%` }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-blue-600 font-bold text-sm">Top 5% in JKSSB</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black text-slate-900">45s</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg. Time per Question</div>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <div key={i} className={cn("h-2 flex-grow rounded-full", i < 4 ? "bg-yellow-400" : "bg-slate-100")} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <span>Recent Activity</span>
            </h2>
            <div className="space-y-4">
              {results.length > 0 ? results.map((result, i) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      result.accuracy > 80 ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {result.accuracy > 80 ? <CheckCircle className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{result.topic}</h4>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {result.testType} Test • {new Date(result.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">{result.score}/{result.totalQuestions}</div>
                    <div className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      result.accuracy > 80 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {result.accuracy}% Accuracy
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No tests taken yet</h3>
                  <p className="text-slate-500">Start your first mock test to see your performance here.</p>
                  <Link to="/categories" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                    <span>Start Practice</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
          {/* Badges */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Your Badges</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Early Bird', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
                { name: 'Streak 7', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                { name: 'Math Pro', icon: Star, color: 'text-purple-500', bg: 'bg-purple-50' },
                { name: 'GK Master', icon: Award, color: 'text-green-500', bg: 'bg-green-50' },
              ].map((badge, i) => (
                <div key={i} className="group relative">
                  <div className={cn("w-full aspect-square rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", badge.bg, badge.color)}>
                    <badge.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 rounded-xl border border-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors">
              View All Badges
            </button>
          </section>

          {/* Recommended Topics */}
          <section className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold">Recommended for You</h3>
              <p className="text-blue-100 text-sm">Based on your weak areas, we suggest practicing these topics:</p>
              <div className="space-y-4">
                {[
                  { name: 'JK History', cat: 'JK GK' },
                  { name: 'Trigonometry', cat: 'Math' },
                  { name: 'Current Affairs', cat: 'GA' },
                ].map((topic, i) => (
                  <Link
                    key={i}
                    to={`/topic/${encodeURIComponent(topic.name)}`}
                    className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-sm">{topic.name}</div>
                      <div className="text-[10px] text-blue-200 uppercase tracking-wider">{topic.cat}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Daily Challenge */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Daily Challenge</h3>
            </div>
            <p className="text-slate-500 text-sm">Complete 20 MCQs in General Awareness today to earn double XP!</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Progress</span>
                <span>12/20</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 w-[60%]" />
              </div>
            </div>
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              Continue Challenge
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
