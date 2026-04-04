import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateMCQs, DifficultyDistribution } from '../services/geminiService';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface GenerateMCQModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  topic: string;
  onGenerated?: () => void;
}

export default function GenerateMCQModal({ isOpen, onClose, category, topic, onGenerated }: GenerateMCQModalProps) {
  const [count, setCount] = useState(10);
  const [distribution, setDistribution] = useState<DifficultyDistribution>({ easy: 40, medium: 40, hard: 20 });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'saving' | 'success' | 'error'>('idle');

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('generating');
    try {
      const mcqs = await generateMCQs(category, topic, count, distribution);
      if (mcqs.length === 0) throw new Error('No MCQs generated');
      
      setStatus('saving');
      const mcqCollection = collection(db, 'mcqs');
      for (const mcq of mcqs) {
        await addDoc(mcqCollection, mcq);
      }
      
      setStatus('success');
      setTimeout(() => {
        onGenerated?.();
        onClose();
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Generation failed:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Generate MCQs</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Number of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Difficulty Distribution (%)</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-green-600">Easy</span>
                      <input
                        type="number"
                        value={distribution.easy}
                        onChange={(e) => setDistribution(prev => ({ ...prev, easy: Number(e.target.value) }))}
                        className="w-full p-3 bg-green-50 border border-green-100 rounded-xl text-center font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-orange-600">Medium</span>
                      <input
                        type="number"
                        value={distribution.medium}
                        onChange={(e) => setDistribution(prev => ({ ...prev, medium: Number(e.target.value) }))}
                        className="w-full p-3 bg-orange-50 border border-orange-100 rounded-xl text-center font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-red-600">Hard</span>
                      <input
                        type="number"
                        value={distribution.hard}
                        onChange={(e) => setDistribution(prev => ({ ...prev, hard: Number(e.target.value) }))}
                        className="w-full p-3 bg-red-50 border border-red-100 rounded-xl text-center font-bold"
                      />
                    </div>
                  </div>
                  {distribution.easy + distribution.medium + distribution.hard !== 100 && (
                    <p className="text-xs text-red-500 font-bold text-center">Total must equal 100%</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || distribution.easy + distribution.medium + distribution.hard !== 100}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3",
                  status === 'success' ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 disabled:opacity-50"
                )}
              >
                {status === 'idle' && (
                  <>
                    <Zap className="w-6 h-6 fill-current" />
                    <span>Generate Now</span>
                  </>
                )}
                {status === 'generating' && (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>AI is Thinking...</span>
                  </>
                )}
                {status === 'saving' && (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Success!</span>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <AlertCircle className="w-6 h-6" />
                    <span>Try Again</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
