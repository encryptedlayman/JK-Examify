import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Calculator, RotateCcw } from 'lucide-react';
import { ACCOUNTANCY_MOCK_DATA as QUESTIONS } from '../data/accountancyQuestions';

export default function AccountancyMock() {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);

  const handleChoice = (qIdx: number, optIdx: number) => {
    if (userAnswers[qIdx] !== undefined) return;
    const isCorrect = optIdx === QUESTIONS[qIdx].ans;
    setUserAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    if (isCorrect) setScore(prev => prev + 1);
  };

  const answeredCount = Object.keys(userAnswers).length;
  const isComplete = answeredCount === QUESTIONS.length;

  const restartQuiz = () => {
    setUserAnswers({});
    setScore(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-20">
      <header className="bg-blue-600 text-white py-12 px-6 text-center shadow-lg">
        <h1 className="text-4xl font-black mb-2 flex items-center justify-center gap-3">
          <Calculator className="w-10 h-10" />
          Accountancy Mock Test
        </h1>
        <p className="opacity-80">Full Length Mock Exam</p>
      </header>

      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4 flex items-center gap-3 shadow">
        <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-500">
          {answeredCount} / {QUESTIONS.length}
        </span>
      </div>

      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        {QUESTIONS.map((q, idx) => {
          const userAnswer = userAnswers[idx];
          const isAnswered = userAnswer !== undefined;
          
          return (
            <motion.div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="text-xs font-bold text-blue-600 uppercase mb-2">{q.topic}</div>
              <div className="bg-slate-50 p-4 rounded-xl italic text-slate-600 mb-4 border-l-4 border-blue-500">
                {q.statement}
              </div>
              <h3 className="text-lg font-bold mb-6">{q.q}</h3>
              
              <div className="grid gap-3">
                {q.opts.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.ans;
                  const isSelected = userAnswer === optIdx;
                  let colorClass = "bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50";
                  if (isAnswered) {
                    if (isCorrect) colorClass = "bg-green-50 border-green-500 text-green-700";
                    else if (isSelected) colorClass = "bg-red-50 border-red-500 text-red-700";
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleChoice(idx, optIdx)}
                      className={cn("w-full text-left p-4 rounded-xl border-2 transition-all", colorClass)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-blue-50 rounded-xl text-sm italic">
                  <strong>Explanation:</strong> {q.exp}
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {isComplete && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-xl border-2 border-blue-600">
            <h2 className="text-3xl font-black mb-2">Test Completed!</h2>
            <div className="text-6xl font-black text-blue-600 mb-4">{score} / {QUESTIONS.length}</div>
            <button 
              onClick={restartQuiz}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" /> Retake Test
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
