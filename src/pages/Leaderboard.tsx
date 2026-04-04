import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { motion } from 'motion/react';
import { Trophy, Award, Zap, Star, Search, Filter, ChevronRight, Medal, Users, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'Weekly' | 'Monthly' | 'AllTime'>('Weekly');

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        // In a real app, we'd have a scheduled function to update this.
        // For now, we'll query the users collection and sort by XP.
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('xp', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            userId: doc.id,
            displayName: userData.displayName || 'Anonymous',
            photoURL: userData.photoURL || '',
            totalXP: userData.xp || 0,
            period
          } as LeaderboardEntry;
        });
        
        setEntries(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [period]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider"
        >
          <Trophy className="w-4 h-4" />
          <span>Global Rankings</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Climb the <span className="text-blue-600">Leaderboard</span>
        </h1>
        <p className="text-slate-500 text-lg">
          Compete with thousands of aspirants across India. Earn XP by practicing MCQs and taking mock tests to reach the top.
        </p>
      </div>

      {/* Period Filter */}
      <div className="flex items-center justify-center space-x-2 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm w-fit mx-auto">
        {(['Weekly', 'Monthly', 'AllTime'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-8 py-3 rounded-2xl font-bold transition-all",
              period === p ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-12">
        {/* Rank 2 */}
        {topThree[1] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl text-center space-y-6 relative"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center font-black text-xl border-4 border-white shadow-lg">
              2
            </div>
            <div className="relative inline-block">
              <img
                src={topThree[1].photoURL}
                alt={topThree[1].displayName}
                className="w-24 h-24 rounded-3xl border-4 border-slate-50 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <Medal className="absolute -bottom-2 -right-2 w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">{topThree[1].displayName}</h3>
              <div className="text-blue-600 font-black text-lg">{topThree[1].totalXP} XP</div>
            </div>
          </motion.div>
        )}

        {/* Rank 1 */}
        {topThree[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 md:order-2 bg-white p-10 rounded-[3rem] border-4 border-blue-600 shadow-2xl text-center space-y-8 relative scale-110 z-10"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl border-4 border-white shadow-xl">
              1
            </div>
            <div className="relative inline-block">
              <img
                src={topThree[0].photoURL}
                alt={topThree[0].displayName}
                className="w-32 h-32 rounded-[2rem] border-4 border-blue-50 shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <Trophy className="absolute -top-4 -right-4 w-12 h-12 text-yellow-500 drop-shadow-lg" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">{topThree[0].displayName}</h3>
              <div className="text-blue-600 font-black text-2xl">{topThree[0].totalXP} XP</div>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider">
              Global Master
            </div>
          </motion.div>
        )}

        {/* Rank 3 */}
        {topThree[2] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-3 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl text-center space-y-6 relative"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl border-4 border-white shadow-lg">
              3
            </div>
            <div className="relative inline-block">
              <img
                src={topThree[2].photoURL}
                alt={topThree[2].displayName}
                className="w-24 h-24 rounded-3xl border-4 border-orange-50 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <Medal className="absolute -bottom-2 -right-2 w-8 h-8 text-orange-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">{topThree[2].displayName}</h3>
              <div className="text-blue-600 font-black text-lg">{topThree[2].totalXP} XP</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-center justify-between text-xs font-black uppercase tracking-wider shadow-xl">
          <div className="flex items-center space-x-12 px-4">
            <span className="w-8">Rank</span>
            <span>User</span>
          </div>
          <div className="flex items-center space-x-12 px-4">
            <span>Accuracy</span>
            <span className="w-24 text-right">Total XP</span>
          </div>
        </div>

        <div className="space-y-3">
          {rest.map((user, i) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-8 px-4">
                <span className="w-8 font-black text-slate-400 group-hover:text-blue-600 transition-colors">#{i + 4}</span>
                <div className="flex items-center space-x-4">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-2xl border border-slate-50"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-bold text-slate-900">{user.displayName}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Expert Rank</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-12 px-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-bold text-slate-600">92%</span>
                </div>
                <div className="w-24 text-right font-black text-blue-600">{user.totalXP} XP</div>
              </div>
            </motion.div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-24 space-y-4 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No rankings yet</h3>
            <p className="text-slate-500">Be the first to practice and claim the top spot!</p>
          </div>
        )}
      </div>
    </div>
  );
}
