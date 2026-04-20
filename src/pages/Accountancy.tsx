import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Calculator, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { ACCOUNTANCY_QUIZ_DATA as QUESTIONS } from '../data/accountancyQuestions';

export default function Accountancy() {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
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
    setShowResults(false);
    setScore(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getResultMsg = () => {
    const pct = (score / QUESTIONS.length) * 100;
    if (pct >= 85) return { title: "Outstanding!", msg: "Excellent command over Accountancy concepts." };
    if (pct >= 65) return { title: "Well Done!", msg: "Good understanding — review the missed questions." };
    if (pct >= 40) return { title: "Keep Practicing", msg: "Revisit core chapters and attempt again." };
    return { title: "Needs Improvement", msg: "Go through NCERT Accountancy thoroughly and retry." };
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#1a1208] font-serif pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        
        :root {
          --ink: #1a1208;
          --paper: #faf6ee;
          --cream: #f2ead8;
          --gold: #c49a2e;
          --rust: #b84c1e;
          --correct: #2d6a4f;
          --wrong: #9b2226;
          --muted: #7a6b52;
        }

        .antique-header::before {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(196,154,46,0.06) 40px, rgba(196,154,46,0.06) 41px);
        }
      `}</style>

      <header className="bg-[#1a1208] text-[#faf6ee] py-10 px-6 text-center border-b-4 border-[#c49a2e] relative overflow-hidden antique-header">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block bg-[#c49a2e] text-[#1a1208] text-[11px] font-bold tracking-[2px] uppercase px-[14px] py-[4px] rounded-[2px] mb-3"
        >
          Class XI & XII
        </motion.div>
        <h1 className="font-['Playfair_Display'] text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-2">
          Accountancy<br />Statement-Based MCQs
        </h1>
        <p className="text-sm italic opacity-60">Top 20 Questions · Covering Core Concepts</p>
      </header>

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-[#f2ead8] border-b border-[#d9cbb0] px-5 py-4 flex items-center gap-3 shadow-md">
        <div className="flex-grow h-1.5 bg-[#d9cbb0] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#c49a2e]"
            initial={{ width: 0 }}
            animate={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-[#7a6b52] whitespace-nowrap">
          {answeredCount} / {QUESTIONS.length}
        </span>
        <div className="bg-[#1a1208] text-[#faf6ee] text-[11px] font-bold px-3 py-1 rounded-[2px] whitespace-nowrap shadow-sm">
          Score: {score}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        {QUESTIONS.map((q, idx) => {
          const userAnswer = userAnswers[idx];
          const isAnswered = userAnswer !== undefined;
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border border-[#ddd4bf] rounded-[4px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="bg-[#1a1208] text-[#faf6ee] px-[18px] py-[10px] flex justify-between items-center text-[12px] uppercase">
                <span className="font-bold text-[#c49a2e]">Q{idx + 1}</span>
                <span className="italic opacity-50 lowercase tracking-normal">{q.topic}</span>
              </div>
              
              <div className="p-5 pb-0">
                <div className="bg-[#f2ead8] border-l-4 border-[#c49a2e] p-3 rounded-r-[4px] text-sm leading-relaxed italic text-[#7a6b52] mb-4">
                  📋 {q.statement}
                </div>
                <h3 className="font-bold text-[15px] leading-[1.55] mb-5 text-[#1a1208]">
                  {q.q}
                </h3>
                
                <div className="space-y-2 mb-4">
                  {q.opts.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.ans;
                    const isSelected = userAnswer === optIdx;
                    
                    let btnClass = "bg-[#faf6ee] border-[#d9cbb0] hover:border-[#c49a2e] hover:bg-[#fdf8ef]";
                    if (isAnswered) {
                      if (isCorrect) btnClass = "bg-[#f0faf4] border-[#2d6a4f] text-[#2d6a4f]";
                      else if (isSelected) btnClass = "bg-[#fdf0f0] border-[#9b2226] text-[#9b2226]";
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleChoice(idx, optIdx)}
                        className={cn(
                          "w-full text-left border-[1.5px] rounded-[3px] p-4 text-[14px] flex gap-3 items-start transition-all duration-200",
                          btnClass
                        )}
                      >
                        <span className={cn(
                          "font-['Playfair_Display'] font-bold min-w-[20px]",
                          isAnswered && (isCorrect || isSelected) ? "text-inherit" : "text-[#c49a2e]"
                        )}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-[#f5f0e4] border-t border-[#d9cbb0] p-5 text-[13px] leading-relaxed text-[#7a6b52]"
                  >
                    <strong className="text-[#1a1208]">✦ Explanation:</strong> {q.exp}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Results Card */}
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1208] text-[#faf6ee] rounded-[4px] p-10 text-center space-y-4"
          >
            <div className="font-['Playfair_Display'] text-7xl font-black text-[#c49a2e]">
              {score} / {QUESTIONS.length}
            </div>
            <h2 className="font-['Playfair_Display'] text-3xl font-bold">{getResultMsg().title}</h2>
            <p className="text-lg opacity-60">{getResultMsg().msg}</p>
            <button 
              onClick={restartQuiz}
              className="mt-6 bg-[#c49a2e] text-[#1a1208] border-none px-8 py-3 rounded-[3px] font-bold text-lg hover:opacity-80 transition-opacity flex items-center justify-center mx-auto gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
