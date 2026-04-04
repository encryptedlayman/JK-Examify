import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Trophy, Zap, CheckCircle, ArrowRight, Star, Users, Award, LogIn } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function Home() {
  const [user] = useAuthState(auth);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-medium"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Free Mock Tests for JKSSB & SSC Exams</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
            >
              Master Your Exams with <span className="text-blue-300">MockTestPro</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 leading-relaxed"
            >
              Access thousands of topic-wise MCQs, full-length mock tests, and real-time performance analytics. Completely free, mobile-first, and exam-focused.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4"
            >
              <Link
                to="/categories"
                className="w-full sm:w-auto bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Start Free Mock Test</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-blue-500/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Student Login</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-12 flex flex-wrap justify-center gap-8 text-blue-200"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>50,000+ MCQs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Gamified Learning</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Active Users', value: '10K+', icon: Users, color: 'text-blue-600' },
            { label: 'Tests Taken', value: '50K+', icon: Zap, color: 'text-yellow-600' },
            { label: 'Questions', value: '5000+', icon: BookOpen, color: 'text-green-600' },
            { label: 'Success Rate', value: '94%', icon: Award, color: 'text-purple-600' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 text-center space-y-2"
            >
              <div className={cn("w-12 h-12 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Exam Categories</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Choose from our wide range of categories and start practicing topic-wise questions.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              className="group bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:border-blue-500/50 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">{cat.name}</h3>
                  <p className="text-slate-500 text-sm">{cat.topics.length} Topics • 500+ Questions</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.topics.slice(0, 3).map((topic, i) => (
                    <span key={i} className="text-xs font-medium bg-slate-50 text-slate-600 px-3 py-1 rounded-full">
                      {topic}
                    </span>
                  ))}
                  {cat.topics.length > 3 && (
                    <span className="text-xs font-medium bg-slate-50 text-slate-400 px-3 py-1 rounded-full">
                      +{cat.topics.length - 3} more
                    </span>
                  )}
                </div>
                <Link
                  to={`/category/${cat.id}`}
                  className="inline-flex items-center space-x-2 text-blue-600 font-bold group-hover:translate-x-2 transition-transform"
                >
                  <span>Explore Topics</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                Why Choose <span className="text-blue-500">MockTestPro?</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                We provide a comprehensive learning experience designed to help you succeed in competitive exams like JKSSB and SSC.
              </p>
              <div className="space-y-6">
                {[
                  { title: 'Gamified Learning', desc: 'Earn XP, collect badges, and climb the leaderboard as you practice.', icon: Trophy },
                  { title: 'Detailed Explanations', desc: 'Every question comes with a step-by-step explanation to clear your concepts.', icon: Star },
                  { title: 'Performance Analytics', desc: 'Track your accuracy, speed, and weak areas with our advanced dashboard.', icon: Zap },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{feature.title}</h4>
                      <p className="text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20" />
              <div className="relative bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">JD</div>
                    <div>
                      <div className="font-bold">John Doe</div>
                      <div className="text-xs text-slate-500">Expert Rank • 2450 XP</div>
                    </div>
                  </div>
                  <div className="text-blue-500 font-bold">#1 Rank</div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-3/4" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progress to Master</span>
                    <span>75%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {[
                      { label: 'Accuracy', val: '92%' },
                      { label: 'Tests', val: '124' },
                      { label: 'Streak', val: '12' },
                    ].map((s, i) => (
                      <div key={i} className="bg-slate-900/50 p-4 rounded-2xl text-center">
                        <div className="text-lg font-bold text-white">{s.val}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center space-y-8 shadow-2xl shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Ready to Ace Your Exams?
          </h2>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto">
            Join thousands of students who are already improving their scores with MockTestPro.
          </p>
          <div className="pt-4">
            {user ? (
              <Link
                to="/categories"
                className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 inline-flex items-center space-x-3"
              >
                <span>Start Practice Now</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 inline-flex items-center space-x-3"
              >
                <LogIn className="w-6 h-6" />
                <span>Student Login</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
