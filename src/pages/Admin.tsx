import { useState } from 'react';
import { generateAndStoreMCQs } from '../services/questionService';
import { motion } from 'motion/react';
import { Database, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const SECTIONS = [
  { category: 'JKSSB', topics: ['General Knowledge', 'Mathematics', 'Reasoning', 'English', 'Computer Science'] },
  { category: 'SSC', topics: ['General Awareness', 'Quantitative Aptitude', 'General Intelligence', 'English Comprehension'] }
];

export default function Admin() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleBulkGenerate = async () => {
    setLoading(true);
    setStatus('Starting bulk generation...');
    
    let totalTopics = 0;
    SECTIONS.forEach(s => totalTopics += s.topics.length);
    setProgress({ current: 0, total: totalTopics });

    try {
      for (const section of SECTIONS) {
        for (const topic of section.topics) {
          setStatus(`Generating questions for ${section.category} - ${topic}...`);
          try {
            await generateAndStoreMCQs(section.category, topic, 20);
          } catch (err: any) {
            console.error(`Failed for ${topic}:`, err);
            setStatus(`Error in ${topic}: ${err.message || 'Unknown error'}`);
            // Continue with next topic instead of failing everything
            continue;
          }
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
      }
      setStatus('Bulk generation completed!');
    } catch (error: any) {
      console.error('Bulk generation failed:', error);
      setStatus(`Bulk generation failed: ${error.message || 'Check console'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage question database and system settings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Bulk Question Generator</span>
              </h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Generate and store 20 high-quality MCQs for every major section in the database using Gemini AI.
            </p>
            <button
              onClick={handleBulkGenerate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
              <span>{loading ? 'Generating...' : 'Start Bulk Generation'}</span>
            </button>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>System Status</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Database Connection</span>
                <span className="text-green-600 font-bold">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Gemini API</span>
                <span className="text-green-600 font-bold">Ready</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Auth Service</span>
                <span className="text-green-600 font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-6 rounded-3xl border flex items-start space-x-4",
              status.includes('Error') ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
            )}
          >
            {status.includes('Error') ? <AlertCircle className="w-6 h-6 flex-shrink-0" /> : <CheckCircle className="w-6 h-6 flex-shrink-0" />}
            <div className="space-y-2 flex-grow">
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
          </motion.div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
