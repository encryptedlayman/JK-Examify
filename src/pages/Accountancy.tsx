import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Calculator, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const QUESTIONS = [
  {
    topic: "Accounting Equation",
    statement: "A business owner withdraws ₹10,000 cash for personal use.",
    q: "Which of the following correctly describes the effect on the accounting equation?",
    opts: ["Assets increase, Capital increases", "Assets decrease, Capital decreases", "Assets increase, Liabilities increase", "No effect on the equation"],
    ans: 1,
    exp: "Drawings reduce both cash (Asset) and Capital, keeping the equation balanced: Assets = Liabilities + Capital."
  },
  {
    topic: "Journal Entry",
    statement: "Goods worth ₹5,000 were returned by a credit customer, Rohit.",
    q: "What is the correct journal entry for this transaction?",
    opts: ["Debit Sales Return A/c; Credit Rohit's A/c", "Debit Rohit's A/c; Credit Sales Return A/c", "Debit Cash A/c; Credit Sales A/c", "Debit Purchases A/c; Credit Rohit's A/c"],
    ans: 0,
    exp: "Sales Returns (inward returns) increase — Dr. Sales Return A/c. Rohit's debtor account is credited as his balance reduces."
  },
  {
    topic: "Bank Reconciliation",
    statement: "A cheque issued to a supplier for ₹8,000 has not yet been presented to the bank for payment.",
    q: "How would this appear in a Bank Reconciliation Statement (starting with Cash Book balance)?",
    opts: ["Add ₹8,000 to Cash Book balance", "Deduct ₹8,000 from Pass Book balance", "Add ₹8,000 to Pass Book balance", "Deduct ₹8,000 from Cash Book balance"],
    ans: 2,
    exp: "Unpresented cheques reduce the Cash Book but not the Pass Book yet, so add the amount to the Pass Book balance to reconcile."
  },
  {
    topic: "Depreciation",
    statement: "A machine bought for ₹1,00,000 has a useful life of 10 years and scrap value of ₹10,000. The firm uses SLM.",
    q: "What is the annual depreciation under the Straight Line Method?",
    opts: ["₹10,000", "₹9,000", "₹11,000", "₹8,000"],
    ans: 1,
    exp: "SLM = (Cost − Scrap) ÷ Life = (1,00,000 − 10,000) ÷ 10 = ₹9,000 per year."
  },
  {
    topic: "Bills of Exchange",
    statement: "Aman draws a bill on Bimal for ₹20,000 for 3 months. Bimal accepts and returns it to Aman.",
    q: "In Aman's books, the bill is recorded as:",
    opts: ["Bills Payable", "Bills Receivable", "Creditor", "Debtor"],
    ans: 1,
    exp: "Aman is the drawer who holds the accepted bill. It is an asset — a Bills Receivable — in Aman's books."
  },
  {
    topic: "Trial Balance",
    statement: "The trial balance of a firm shows total debits = ₹5,42,000 and total credits = ₹5,38,000.",
    q: "Which of the following statements is TRUE about this trial balance?",
    opts: ["It proves the books are accurate", "There is a clerical error of ₹4,000", "There is a compensating error", "The difference may be due to an error of principle"],
    ans: 1,
    exp: "A difference of ₹4,000 (5,42,000 − 5,38,000) indicates a clerical error such as wrong posting or omission."
  },
  {
    topic: "Final Accounts",
    statement: "Closing stock appearing in the Trial Balance is shown only in the Balance Sheet.",
    q: "If closing stock does NOT appear in the Trial Balance, it is shown in:",
    opts: ["Only Balance Sheet", "Only Trading Account (credit side)", "Trading Account (credit) and Balance Sheet (asset)", "Profit & Loss Account only"],
    ans: 2,
    exp: "When closing stock is not in the Trial Balance, it appears on the credit side of Trading A/c AND as a current asset in the Balance Sheet."
  },
  {
    topic: "Errors & Rectification",
    statement: "Salary paid ₹12,000 was wrongly debited to Rent Account.",
    q: "What is the rectifying entry?",
    opts: ["Dr. Rent A/c; Cr. Salary A/c ₹12,000", "Dr. Salary A/c; Cr. Rent A/c ₹12,000", "Dr. Salary A/c; Cr. Cash A/c ₹12,000", "No entry needed"],
    ans: 1,
    exp: "To correct: Debit Salary A/c (correct head) and Credit Rent A/c (to reverse wrong entry). This is an error of commission."
  },
  {
    topic: "Capital & Revenue",
    statement: "A firm spends ₹2,00,000 on overhauling a machine, which increases its useful life by 5 years.",
    q: "This expenditure should be classified as:",
    opts: ["Revenue Expenditure", "Capital Expenditure", "Deferred Revenue Expenditure", "Capital Receipt"],
    ans: 1,
    exp: "Expenditure that extends the life or capacity of a fixed asset beyond original estimates is Capital Expenditure."
  },
  {
    topic: "Provisions & Reserves",
    statement: "A firm creates a reserve to meet a future liability of uncertain amount arising from a court case.",
    q: "This is an example of:",
    opts: ["General Reserve", "Specific Reserve", "Provision", "Capital Reserve"],
    ans: 2,
    exp: "A Provision is made for a known liability of uncertain amount (e.g., legal case). Reserves are appropriations from profit."
  },
  {
    topic: "Partnership — Admission",
    statement: "C is admitted into a partnership firm for 1/4th share. The new profit ratio of A, B, and C is 2:1:1.",
    q: "C's share in profit is 1/4. The sacrificing ratio of A and B is:",
    opts: ["1:1", "2:1", "3:1", "Cannot be determined without old ratio"],
    ans: 3,
    exp: "Without knowing A and B's old ratio, the sacrificing ratio cannot be calculated. Old ratio is essential."
  },
  {
    topic: "Goodwill",
    statement: "Average profit of a firm = ₹60,000. Normal profit = ₹45,000. The number of years' purchase = 3.",
    q: "What is the value of goodwill using the Super Profit method?",
    opts: ["₹1,80,000", "₹45,000", "₹60,000", "₹15,000"],
    ans: 1,
    exp: "Super Profit = Avg Profit − Normal Profit = 60,000 − 45,000 = ₹15,000. Goodwill = 15,000 × 3 = ₹45,000."
  },
  {
    topic: "Retirement of Partner",
    statement: "On retirement of a partner, the revaluation account shows a loss of ₹30,000.",
    q: "This loss will be:",
    opts: ["Credited to all partners' capital in new ratio", "Debited to all partners' capital in old ratio", "Credited to retiring partner only", "Transferred to General Reserve"],
    ans: 1,
    exp: "Revaluation loss is borne by all partners (including the retiring one) in the old profit-sharing ratio."
  },
  {
    topic: "Death of Partner",
    statement: "A partner dies on 1st July. The firm's accounting year ends 31st March. Profits are to be shared till death.",
    q: "Profit credited to the deceased partner's executor will be calculated for:",
    opts: ["Full year", "3 months (April–June)", "6 months", "9 months"],
    ans: 1,
    exp: "From 1st April to 1st July = 3 months. Profit is calculated proportionately for the period the partner was alive."
  },
  {
    topic: "Dissolution of Firm",
    statement: "On dissolution, a creditor accepts machinery (book value ₹40,000) in settlement of his debt of ₹45,000.",
    q: "The gain or loss on this transaction is:",
    opts: ["Loss of ₹5,000 to the firm", "Gain of ₹5,000 to the firm", "No gain or loss", "Loss transferred to Realisation A/c debit side"],
    ans: 1,
    exp: "Creditor accepts ₹40,000 asset for ₹45,000 debt — debt reduced by ₹5,000 more than asset value. Gain of ₹5,000 credited to Realisation A/c."
  },
  {
    topic: "Share Capital",
    statement: "A company issues 10,000 shares of ₹10 each at ₹12. Applications were received for 15,000 shares.",
    q: "The amount received as securities premium on allotment of shares is:",
    opts: ["₹1,50,000", "₹20,000", "₹1,00,000", "₹30,000"],
    ans: 1,
    exp: "Premium = ₹2 per share × 10,000 shares allotted = ₹20,000. (Only allotted shares carry premium.)"
  },
  {
    topic: "Debentures",
    statement: "A company issues 1,000, 9% Debentures of ₹100 each at a discount of 5%, redeemable at par.",
    q: "The amount of discount on issue of debentures is:",
    opts: ["₹9,000", "₹5,000", "₹4,500", "₹10,000"],
    ans: 1,
    exp: "Discount = 5% × ₹1,00,000 face value = ₹5,000. This is a capital loss written off over the debenture's life."
  },
  {
    topic: "Cash Flow Statement",
    statement: "A company purchases machinery worth ₹3,00,000 and pays ₹1,00,000 in cash; balance payable later.",
    q: "In the Cash Flow Statement, the cash outflow under investing activities is:",
    opts: ["₹3,00,000", "₹2,00,000", "₹1,00,000", "Nil"],
    ans: 2,
    exp: "Only the cash actually paid (₹1,00,000) is shown as an outflow. The balance ₹2,00,000 is a non-cash transaction."
  },
  {
    topic: "Ratio Analysis",
    statement: "Current Assets = ₹4,00,000; Current Liabilities = ₹2,00,000; Inventory = ₹80,000.",
    q: "What is the Quick (Acid-Test) Ratio?",
    opts: ["2:1", "1.6:1", "1.5:1", "3:1"],
    ans: 1,
    exp: "Quick Assets = Current Assets − Inventory = 4,00,000 − 80,000 = 3,20,000. Quick Ratio = 3,20,000 ÷ 2,00,000 = 1.6:1."
  },
  {
    topic: "Computerised Accounting",
    statement: "In computerised accounting, the ledger is automatically updated as soon as a journal entry is saved.",
    q: "This feature of computerised accounting is known as:",
    opts: ["Real-time processing", "Batch processing", "Manual posting", "Deferred updating"],
    ans: 0,
    exp: "Real-time processing means data is processed immediately as it is entered, updating all related accounts instantly."
  }
];

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
