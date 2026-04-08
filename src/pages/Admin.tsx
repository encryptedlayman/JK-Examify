import { useState, useEffect } from 'react';
import { generateAndStoreMCQs, getMCQCount, generateAndStoreMCQsFromPDF } from '../services/questionService';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Zap, CheckCircle, AlertCircle, Loader2, Plus, FileJson, BarChart3, ChevronRight, Search, Trash2, Edit3, FileUp } from 'lucide-react';
import { CATEGORIES, DIFFICULTIES } from '../constants';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function Admin() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [stats, setStats] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'bulk' | 'manual' | 'stats' | 'pdf'>('bulk');

  // Bulk Gen State
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].name);
  const [selectedTopic, setSelectedTopic] = useState(CATEGORIES[0].topics[0]);
  const [numQuestions, setNumQuestions] = useState(20);

  // PDF State
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Manual Add State
  const [manualMCQ, setManualMCQ] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
    difficulty: 'Medium' as any,
    category: CATEGORIES[0].name,
    topic: CATEGORIES[0].topics[0]
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const newStats: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      const count = await getMCQCount(cat.name);
      newStats[cat.name] = count;
    }
    const total = await getMCQCount();
    newStats['Total'] = total;
    setStats(newStats);
  };

  const handleBulkGenerate = async () => {
    setLoading(true);
    setStatus(`Generating ${numQuestions} questions for ${selectedCategory} - ${selectedTopic}...`);
    setProgress({ current: 0, total: 1 });

    try {
      // If the user wants 100s, we should batch them in 20s to avoid timeouts
      const batchSize = 20;
      const batches = Math.ceil(numQuestions / batchSize);
      setProgress({ current: 0, total: batches });

      for (let i = 0; i < batches; i++) {
        const count = Math.min(batchSize, numQuestions - (i * batchSize));
        setStatus(`Batch ${i + 1}/${batches}: Generating ${count} questions...`);
        await generateAndStoreMCQs(selectedCategory, selectedTopic, count);
        setProgress(prev => ({ ...prev, current: i + 1 }));
        
        // Add a small delay between batches to avoid rate limits
        if (i < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setStatus('Bulk generation completed!');
      loadStats();
    } catch (error: any) {
      console.error('Bulk generation failed:', error);
      setStatus(`Bulk generation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const mcqCollection = collection(db, 'mcqs');
      await addDoc(mcqCollection, {
        ...manualMCQ,
        examType: ['JKSSB', 'SSC'],
        createdAt: new Date().toISOString()
      });
      setStatus('MCQ added successfully!');
      setManualMCQ({
        ...manualMCQ,
        question: '',
        options: ['', '', '', ''],
        explanation: ''
      });
      loadStats();
    } catch (error: any) {
      setStatus(`Failed to add MCQ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePDFUpload = async () => {
    if (!pdfFile) return;
    setLoading(true);
    setStatus(`Processing PDF and generating ${numQuestions} questions...`);
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(pdfFile);
      const pdfBase64 = await base64Promise;

      await generateAndStoreMCQsFromPDF(selectedCategory, selectedTopic, pdfBase64, numQuestions);
      
      setStatus('PDF processing and generation completed!');
      setPdfFile(null);
      loadStats();
    } catch (error: any) {
      console.error('PDF generation failed:', error);
      setStatus(`PDF generation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage your question bank and system settings.</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'bulk', label: 'Bulk Gen', icon: Zap },
            { id: 'pdf', label: 'PDF Seed', icon: FileUp },
            { id: 'manual', label: 'Manual Add', icon: Plus },
            { id: 'stats', label: 'Statistics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-900">Quick Stats</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="text-xs font-black text-blue-600 uppercase tracking-wider">Total MCQs</div>
                <div className="text-3xl font-black text-slate-900">{stats['Total'] || 0}</div>
              </div>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">{cat.name}</span>
                    <span className="font-black text-slate-900">{stats[cat.name] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={loadStats}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Refresh Stats
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] shadow-xl text-white space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Pro Tip</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Batch generation helps avoid timeouts. Aim for 20-50 questions at a time for best results.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'bulk' && (
              <motion.div
                key="bulk"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">Bulk AI Generation</h2>
                  <p className="text-slate-500">Generate high-quality MCQs using Gemini 3.1 Pro.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        const cat = CATEGORIES.find(c => c.name === e.target.value);
                        if (cat) setSelectedTopic(cat.topics[0]);
                      }}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Topic</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {CATEGORIES.find(c => c.name === selectedCategory)?.topics.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Number of Questions</label>
                    <input
                      type="number"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleBulkGenerate}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center space-x-3"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                      <span>{loading ? 'Generating...' : 'Start Generation'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-blue-900">Deep Database Seed</h3>
                      <p className="text-blue-700 text-sm">Add 500 high-quality MCQs to every single category (topic-wise).</p>
                    </div>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        setStatus('Starting deep seed operation (500 per category)...');
                        const questionsPerCat = 500;
                        const batchSize = 20;
                        const batchesPerCat = Math.ceil(questionsPerCat / batchSize);
                        const totalOps = CATEGORIES.length * batchesPerCat;
                        
                        setProgress({ current: 0, total: totalOps });
                        try {
                          for (const cat of CATEGORIES) {
                            for (let i = 0; i < batchesPerCat; i++) {
                              const topic = cat.topics[i % cat.topics.length];
                              setStatus(`Seeding ${cat.name} (${i+1}/${batchesPerCat}): ${topic}...`);
                              await generateAndStoreMCQs(cat.name, topic, batchSize);
                              setProgress(prev => ({ ...prev, current: prev.current + 1 }));
                              
                              // Add a delay between batches in deep seed
                              await new Promise(resolve => setTimeout(resolve, 2000));
                            }
                          }
                          setStatus('Deep seed completed! 500 MCQs added to every section.');
                          loadStats();
                        } catch (err: any) {
                          setStatus(`Deep seed failed: ${err.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-900 transition-all shadow-xl disabled:opacity-50 whitespace-nowrap"
                    >
                      Seed 500 Per Section
                    </button>
                  </div>
                </div>

                {status && (
                  <div className={cn(
                    "p-6 rounded-3xl border flex items-start space-x-4",
                    status.includes('Error') || status.includes('failed') ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
                  )}>
                    <div className="space-y-3 flex-grow">
                      <p className="font-bold">{status}</p>
                      {loading && (
                        <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full transition-all duration-500" 
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'pdf' && (
              <motion.div
                key="pdf"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">PDF Question Seeding</h2>
                  <p className="text-slate-500">Upload a PDF file and let Gemini extract MCQs from it.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Target Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        const cat = CATEGORIES.find(c => c.name === e.target.value);
                        if (cat) setSelectedTopic(cat.topics[0]);
                      }}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Target Topic</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {CATEGORIES.find(c => c.name === selectedCategory)?.topics.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Questions to Extract</label>
                    <input
                      type="number"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Upload PDF</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="flex items-center justify-center space-x-2 w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl font-bold cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <FileUp className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-600">{pdfFile ? pdfFile.name : 'Choose PDF File'}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-end pt-4">
                  <button
                    onClick={handlePDFUpload}
                    disabled={loading || !pdfFile}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center space-x-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileUp className="w-6 h-6" />}
                    <span>{loading ? 'Processing PDF...' : 'Generate from PDF'}</span>
                  </button>
                </div>

                {status && (
                  <div className={cn(
                    "p-6 rounded-3xl border flex items-start space-x-4",
                    status.includes('Error') || status.includes('failed') ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
                  )}>
                    <p className="font-bold">{status}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">Add Question Manually</h2>
                  <p className="text-slate-500">Fill in the details to add a single MCQ to the database.</p>
                </div>

                <form onSubmit={handleManualAdd} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Category</label>
                      <select
                        value={manualMCQ.category}
                        onChange={(e) => setManualMCQ({ ...manualMCQ, category: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Topic</label>
                      <select
                        value={manualMCQ.topic}
                        onChange={(e) => setManualMCQ({ ...manualMCQ, topic: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                      >
                        {CATEGORIES.find(c => c.name === manualMCQ.category)?.topics.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Question Text</label>
                    <textarea
                      required
                      value={manualMCQ.question}
                      onChange={(e) => setManualMCQ({ ...manualMCQ, question: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none min-h-[100px]"
                      placeholder="Enter the question here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {manualMCQ.options.map((opt, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Option {String.fromCharCode(65 + i)}</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={manualMCQ.answer === i}
                            onChange={() => setManualMCQ({ ...manualMCQ, answer: i })}
                            className="w-5 h-5 text-blue-600"
                          />
                          <input
                            required
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...manualMCQ.options];
                              newOpts[i] = e.target.value;
                              setManualMCQ({ ...manualMCQ, options: newOpts });
                            }}
                            className="flex-grow p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                            placeholder={`Option ${i + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Explanation</label>
                    <textarea
                      required
                      value={manualMCQ.explanation}
                      onChange={(e) => setManualMCQ({ ...manualMCQ, explanation: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none min-h-[100px]"
                      placeholder="Explain why the answer is correct..."
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-4">
                      {DIFFICULTIES.map(diff => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setManualMCQ({ ...manualMCQ, difficulty: diff })}
                          className={cn(
                            "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                            manualMCQ.difficulty === diff ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          )}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Question'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Database Statistics</h2>
                    <p className="text-slate-500">Detailed breakdown of questions across all categories.</p>
                  </div>
                  <button 
                    onClick={loadStats}
                    className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900">{cat.name}</h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black">
                          {stats[cat.name] || 0} MCQs
                        </span>
                      </div>
                      <div className="space-y-2">
                        {cat.topics.slice(0, 3).map(topic => (
                          <div key={topic} className="flex items-center justify-between text-xs text-slate-500">
                            <span>{topic}</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        ))}
                        {cat.topics.length > 3 && (
                          <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest pt-2">
                            + {cat.topics.length - 3} More Topics
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
