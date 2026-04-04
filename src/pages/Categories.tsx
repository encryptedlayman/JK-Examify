import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';
import { BookOpen, ChevronRight, Search, Filter, ArrowLeft, Zap, Star, Plus, Users } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { cn } from '../lib/utils';
import GenerateMCQModal from '../components/GenerateMCQModal';

export default function Categories() {
  const { categoryId } = useParams();
  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryId || 'all');
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; category: string; topic: string }>({
    isOpen: false,
    category: '',
    topic: ''
  });

  const filteredCategories = useMemo(() => {
    let cats = CATEGORIES;
    if (activeCategory !== 'all') {
      cats = cats.filter(c => c.id === activeCategory);
    }
    if (searchQuery) {
      cats = cats.map(c => ({
        ...c,
        topics: c.topics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      })).filter(c => c.topics.length > 0);
    }
    return cats;
  }, [activeCategory, searchQuery]);

  const openModal = (category: string, topic: string) => {
    setModalConfig({ isOpen: true, category, topic });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center space-x-2 text-blue-600 font-bold hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Explore <span className="text-blue-600">Exam Topics</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Select a category and choose a topic to start your practice session. Each topic contains <span className="text-blue-600 font-bold">1000+ recently asked MCQs</span> with detailed explanations.
          </p>
          {user?.email === 'flust1996@gmail.com' && (
            <Link to="/admin" className="inline-flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>Admin: Bulk Generate</span>
            </Link>
          )}
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics (e.g. History, Algebra)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            "px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all",
            activeCategory === 'all' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all",
              activeCategory === cat.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="space-y-16">
        {filteredCategories.map((cat) => (
          <section key={cat.id} className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{cat.name}</h2>
              <div className="h-px flex-grow bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.topics.map((topic, i) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-2xl flex items-center justify-center transition-colors">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold">4.8</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        <Users className="w-3 h-3" />
                        <span className="text-[10px] font-black">{Math.floor(Math.random() * 50) + 10} Live</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{topic}</h3>
                  <p className="text-slate-500 text-sm mb-6">Master this topic with our curated set of 1000+ MCQs and detailed solutions.</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <button
                      onClick={() => openModal(cat.name, topic)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                      title="Generate more questions"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/topic/${encodeURIComponent(topic)}`}
                      className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-all"
                    >
                      <span>Practice</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No topics found</h3>
            <p className="text-slate-500">Try searching for something else or browse all categories.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-blue-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <GenerateMCQModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        category={modalConfig.category}
        topic={modalConfig.topic}
      />
    </div>
  );
}
