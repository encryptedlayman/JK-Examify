import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy, limit, where, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Users, BookOpen, BarChart3, Search, Trash2, Edit3, 
  CheckCircle, XCircle, ChevronRight, ChevronLeft, Loader2, 
  UserPlus, UserMinus, Save, X, Filter, Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, MCQ } from '../types';
import { CATEGORIES } from '../constants';

type Tab = 'users' | 'questions' | 'overview';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalTests: 0
  });

  // Search & Filter State
  const [userSearch, setUserSearch] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Edit State
  const [editingQuestion, setEditingQuestion] = useState<MCQ | null>(null);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'questions') fetchQuestions();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const questionsSnap = await getDocs(collection(db, 'mcqs'));
      const testsSnap = await getDocs(collection(db, 'testResults'));
      
      setStats({
        totalUsers: usersSnap.size,
        totalQuestions: questionsSnap.size,
        totalTests: testsSnap.size
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'));
      const snap = await getDocs(q);
      const userData = snap.docs.map(doc => ({ ...doc.data(), uid: doc.id } as any));
      setUsers(userData);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'mcqs'), limit(100));
      if (selectedCategory !== 'All') {
        q = query(collection(db, 'mcqs'), where('category', '==', selectedCategory), limit(100));
      }
      const snap = await getDocs(q);
      const mcqData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      setQuestions(mcqData);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (user: any) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
      setUsers(users.map(u => u.uid === user.uid ? { ...u, role: newRole } : u) as any);
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteDoc(doc(db, 'mcqs', id));
      setQuestions(questions.filter(q => q.id !== id));
      setStats(prev => ({ ...prev, totalQuestions: prev.totalQuestions - 1 }));
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    try {
      const { id, ...data } = editingQuestion;
      await updateDoc(doc(db, 'mcqs', id), data as any);
      setQuestions(questions.map(q => q.id === id ? editingQuestion : q));
      setEditingQuestion(null);
    } catch (err) {
      console.error('Error updating question:', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
    q.topic.toLowerCase().includes(questionSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-red-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-red-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Super Admin</h1>
            <p className="text-slate-500 font-medium">Full control over users, content, and system.</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'questions', label: 'Questions', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                activeTab === tab.id ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Questions', value: stats.totalQuestions, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Tests Taken', value: stats.totalTests, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
                <div>
                  <div className="text-4xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center space-x-4">
              <Search className="w-6 h-6 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="flex-grow bg-transparent font-bold outline-none text-slate-700"
              />
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">XP / Rank</th>
                    <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user: any) => (
                    <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                          <div>
                            <div className="font-black text-slate-900">{user.displayName}</div>
                            <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{user.xp} XP</span>
                          <span className="text-xs text-blue-600 font-bold">{user.rank}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          user.role === 'admin' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        )}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleToggleAdmin(user)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            user.role === 'admin' ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          )}
                          title={user.role === 'admin' ? "Revoke Admin" : "Make Admin"}
                        >
                          {user.role === 'admin' ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && (
                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                  <p className="text-slate-500 font-bold">Loading users...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center space-x-4">
                <Search className="w-6 h-6 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search questions or topics..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="flex-grow bg-transparent font-bold outline-none text-slate-700"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white px-6 py-4 rounded-3xl shadow-lg border border-slate-100 font-bold text-slate-700 outline-none"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredQuestions.map((q) => (
                <div key={q.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {q.category}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {q.topic}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{q.question}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setEditingQuestion(q)}
                        className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, i) => (
                      <div key={i} className={cn(
                        "p-4 rounded-2xl border text-sm font-medium",
                        i === q.answer ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-50 border-slate-100 text-slate-500"
                      )}>
                        <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                  <p className="text-slate-500 font-bold">Loading questions...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-2xl font-black text-slate-900">Edit Question</h2>
                <button onClick={() => setEditingQuestion(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleUpdateQuestion} className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Text</label>
                  <textarea 
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Option {String.fromCharCode(65 + i)}</label>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          checked={editingQuestion.answer === i}
                          onChange={() => setEditingQuestion({ ...editingQuestion, answer: i })}
                          className="w-5 h-5 text-red-600"
                        />
                        <input 
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...editingQuestion.options];
                            newOpts[i] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOpts });
                          }}
                          className="flex-grow p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Explanation</label>
                  <textarea 
                    value={editingQuestion.explanation}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none min-h-[100px]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingQuestion(null)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
