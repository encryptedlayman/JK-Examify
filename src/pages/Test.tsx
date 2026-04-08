import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc, increment, setDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { MCQ, TestResult, UserProfile } from '../types';
import { getMCQsFromFirestore } from '../services/questionService';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Trophy, Zap, Award, BarChart3, RotateCcw, Home, Share2, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Test() {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'practice';
  const category = searchParams.get('category') || 'General Knowledge';
  const decodedTopic = decodeURIComponent(topicId || '');
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [loading, setLoading] = useState(true);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'copied' | 'error'>('idle');

  const handleShare = async (correctCount: number, total: number, accuracy: number, timeTaken: number) => {
    const summary = `🏆 I just completed a test on JK Examify!\n\n📚 Topic: ${decodedTopic}\n✅ Score: ${correctCount}/${total}\n🎯 Accuracy: ${accuracy}%\n⏱️ Time: ${formatTime(timeTaken)}\n\nPractice now at: ${window.location.origin}`;

    if (navigator.share) {
      try {
        setShareStatus('sharing');
        await navigator.share({
          title: 'My JK Examify Result',
          text: summary,
          url: window.location.origin,
        });
        setShareStatus('idle');
      } catch (err) {
        // User might have cancelled
        setShareStatus('idle');
        console.log('Share cancelled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(summary);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch (err) {
        console.error('Error copying:', err);
        setShareStatus('error');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    }
  };

  useEffect(() => {
    async function loadMCQs() {
      setLoading(true);
      try {
        const data = await getMCQsFromFirestore(category, decodedTopic, 10);
        setMcqs(data);
        if (mode === 'mock') {
          setTimeLeft(data.length * 60); // 1 minute per question
        }
      } catch (error) {
        console.error('Error loading MCQs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMCQs();
  }, [decodedTopic, mode, category]);

  // Real-time activity listener
  useEffect(() => {
    const path = 'testResults';
    const q = query(collection(db, path), orderBy('completedAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => doc.data());
      setRecentActivity(activities);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (mode === 'mock' && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (mode === 'mock' && timeLeft === 0 && !isFinished) {
      finishTest();
    }
  }, [timeLeft, mode, isFinished]);

  const handleAnswer = (optionIndex: number) => {
    if (isFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    if (mode === 'practice') {
      setShowExplanation(true);
    }
  };

  const finishTest = useCallback(async () => {
    setIsFinished(true);
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    
    let correctCount = 0;
    mcqs.forEach((mcq, index) => {
      if (selectedAnswers[index] === mcq.answer) {
        correctCount++;
      }
    });

    const result: TestResult = {
      userId: user?.uid || 'anonymous',
      testType: mode === 'mock' ? 'Full' : 'Topic',
      category: 'General Knowledge', // Should be dynamic
      topic: decodedTopic,
      score: correctCount,
      totalQuestions: mcqs.length,
      accuracy: (correctCount / mcqs.length) * 100,
      timeTaken,
      completedAt: new Date().toISOString()
    };

    if (user) {
      try {
        const resultsPath = 'testResults';
        try {
          await addDoc(collection(db, resultsPath), result);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, resultsPath);
        }
        
        // Update User XP and Stats
        const userPath = `users/${user.uid}`;
        const userRef = doc(db, 'users', user.uid);
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, userPath);
        }
        
        const xpGained = correctCount * 10 + (mode === 'mock' ? 50 : 20);
        
        if (userSnap?.exists()) {
          try {
            await updateDoc(userRef, {
              xp: increment(xpGained),
              lastActive: new Date().toISOString()
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, userPath);
          }
        } else {
          try {
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName || 'User',
              email: user.email || '',
              photoURL: user.photoURL || '',
              xp: xpGained,
              streak: 1,
              lastActive: new Date().toISOString(),
              badges: [],
              rank: 'Beginner',
              role: user.email === 'flust1996@gmail.com' ? 'admin' : 'user'
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, userPath);
          }
        }
      } catch (error) {
        console.error('Error saving result:', error);
      }
    }
  }, [mcqs, selectedAnswers, user, mode, decodedTopic, startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isFinished) {
    const correctCount = mcqs.reduce((acc, mcq, i) => selectedAnswers[i] === mcq.answer ? acc + 1 : acc, 0);
    const accuracy = Math.round((correctCount / mcqs.length) * 100);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto px-4 py-12 space-y-12"
      >
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900">Test Completed!</h1>
            <p className="text-slate-500 text-lg">Great job! Here's how you performed in {decodedTopic}.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Score', value: `${correctCount}/${mcqs.length}`, icon: Award, color: 'text-blue-600' },
              { label: 'Accuracy', value: `${accuracy}%`, icon: Zap, color: 'text-yellow-600' },
              { label: 'Time Taken', value: formatTime(timeTaken), icon: Clock, color: 'text-green-600' },
              { label: 'XP Gained', value: `+${correctCount * 10}`, icon: Trophy, color: 'text-purple-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                <stat.icon className={cn("w-6 h-6 mx-auto", stat.color)} />
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retake Test</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </button>
            <button
              onClick={() => handleShare(correctCount, mcqs.length, accuracy, timeTaken)}
              className={cn(
                "w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2",
                shareStatus === 'copied' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {shareStatus === 'copied' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  <span>Share Result</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Review Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Question Review</span>
          </h2>
          <div className="space-y-6">
            {mcqs.map((mcq, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center font-bold text-sm">
                      Q{i + 1}
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      mcq.difficulty === 'Easy' ? "bg-green-100 text-green-600" :
                      mcq.difficulty === 'Medium' ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                    )}>
                      {mcq.difficulty}
                    </span>
                  </div>
                  {selectedAnswers[i] === mcq.answer ? (
                    <div className="flex items-center space-x-1 text-green-600 font-bold text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600 font-bold text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 leading-relaxed">{mcq.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mcq.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={cn(
                        "p-4 rounded-2xl border text-sm font-medium transition-all",
                        optIdx === mcq.answer ? "bg-green-50 border-green-200 text-green-700" :
                        optIdx === selectedAnswers[i] ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-50 border-slate-100 text-slate-500"
                      )}
                    >
                      <span className="mr-2 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-2">
                  <div className="text-xs font-black text-blue-600 uppercase tracking-wider">Explanation</div>
                  <div className="text-blue-800 text-sm leading-relaxed">
                    <ReactMarkdown>{mcq.explanation}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const currentMCQ = mcqs[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
      <div className="flex-grow space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">{decodedTopic}</h1>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {mode === 'mock' ? 'Mock Test' : 'Practice Mode'} • {currentIndex + 1} of {mcqs.length}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowRestartConfirm(true)}
                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                title="Restart Test"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showRestartConfirm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 z-50 space-y-4"
                  >
                    <p className="text-sm font-bold text-slate-900">Restart the test? All progress will be lost.</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.location.reload()}
                        className="flex-grow bg-red-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                      >
                        Yes, Restart
                      </button>
                      <button
                        onClick={() => setShowRestartConfirm(false)}
                        className="flex-grow bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {mode === 'mock' && (
              <div className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-xl font-black transition-colors",
                timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-blue-600"
              )}>
                <Clock className="w-5 h-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={finishTest}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / mcqs.length) * 100}%` }}
            className="h-full bg-blue-600"
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-12 min-h-[500px] flex flex-col"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
                  Question {currentIndex + 1}
                </span>
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider",
                  currentMCQ.difficulty === 'Easy' ? "bg-green-100 text-green-600" :
                  currentMCQ.difficulty === 'Medium' ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                )}>
                  {currentMCQ.difficulty}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                {currentMCQ.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
              {currentMCQ.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={mode === 'practice' && showExplanation}
                  className={cn(
                    "p-6 rounded-3xl border-2 text-left transition-all group relative overflow-hidden",
                    selectedAnswers[currentIndex] === i
                      ? (mode === 'practice'
                          ? (i === currentMCQ.answer ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50")
                          : "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100")
                      : "border-slate-100 bg-slate-50 hover:border-blue-300 hover:bg-white"
                  )}
                >
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-colors",
                      selectedAnswers[currentIndex] === i
                        ? (mode === 'practice'
                            ? (i === currentMCQ.answer ? "bg-green-600 text-white" : "bg-red-600 text-white")
                            : "bg-blue-600 text-white")
                        : "bg-white text-slate-400 group-hover:text-blue-600"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={cn(
                      "text-lg font-bold transition-colors",
                      selectedAnswers[currentIndex] === i
                        ? (mode === 'practice'
                            ? (i === currentMCQ.answer ? "text-green-900" : "text-red-900")
                            : "text-blue-900")
                        : "text-slate-600 group-hover:text-slate-900"
                    )}>
                      {option}
                    </span>
                  </div>
                  {mode === 'practice' && showExplanation && i === currentMCQ.answer && (
                    <div className="absolute top-1/2 right-4 -translate-y-1/2">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {mode === 'practice' && showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-blue-600 uppercase tracking-wider">Explanation</div>
                  <button
                    onClick={() => {
                      setShowExplanation(false);
                      if (currentIndex < mcqs.length - 1) setCurrentIndex(prev => prev + 1);
                    }}
                    className="text-blue-600 font-bold text-sm hover:underline"
                  >
                    Next Question
                  </button>
                </div>
                <div className="text-blue-900 leading-relaxed prose prose-blue max-w-none">
                  <ReactMarkdown>{currentMCQ.explanation}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentIndex(prev => Math.max(0, prev - 1));
              setShowExplanation(false);
            }}
            disabled={currentIndex === 0}
            className="flex items-center space-x-2 text-slate-500 font-bold hover:text-blue-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>Previous</span>
          </button>
          <div className="flex items-center space-x-2">
            {mcqs.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIndex ? "w-8 bg-blue-600" : (selectedAnswers[i] !== undefined ? "bg-blue-200" : "bg-slate-200")
                )}
              />
            ))}
          </div>
          <button
            onClick={() => {
              if (currentIndex < mcqs.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setShowExplanation(false);
              } else {
                finishTest();
              }
            }}
            className="flex items-center space-x-2 text-blue-600 font-bold hover:translate-x-1 transition-all"
          >
            <span>{currentIndex === mcqs.length - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Real-time Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Live Activity</span>
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                  {activity.score}/{activity.totalQuestions}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{activity.topic}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Just completed</div>
                </div>
              </motion.div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] shadow-xl text-white space-y-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Pro Tip</h3>
          <p className="text-blue-100 text-sm leading-relaxed">
            Practice mode shows explanations immediately. Use Mock mode for a real exam experience with a timer.
          </p>
        </div>
      </div>
    </div>
  );
}
