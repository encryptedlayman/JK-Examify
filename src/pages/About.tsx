import { motion } from 'motion/react';
import { Target, Eye, Users, Award, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function About() {
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
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
            >
              Empowering <span className="text-blue-300">Aspirants</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 leading-relaxed"
            >
              JK Examify is dedicated to providing high-quality, accessible, and gamified learning resources for JKSSB and SSC exam preparation.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-6"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              Our mission is to democratize exam preparation by providing a free, comprehensive, and engaging platform. We aim to bridge the gap between aspirants and high-quality study material, ensuring that every student in Jammu & Kashmir and beyond has a fair chance at success.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-6"
          >
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              We envision a future where technology transforms the way students prepare for competitive exams. JK Examify strives to be the leading digital companion for aspirants, fostering a community of learners who are motivated, well-informed, and ready to achieve their career goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-black tracking-tight">Our Core Values</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The principles that guide everything we do at JK Examify.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Accessibility',
                desc: 'Quality education should be free and accessible to everyone, regardless of their background.',
                icon: Users,
                color: 'bg-blue-600/20 text-blue-500'
              },
              {
                title: 'Innovation',
                desc: 'We use gamification and AI to make learning more engaging and effective.',
                icon: Zap,
                color: 'bg-yellow-600/20 text-yellow-500'
              },
              {
                title: 'Integrity',
                desc: 'We provide accurate, up-to-date, and reliable content for exam preparation.',
                icon: ShieldCheck,
                color: 'bg-green-600/20 text-green-500'
              },
              {
                title: 'Excellence',
                desc: 'We strive for excellence in our platform design and content quality.',
                icon: Award,
                color: 'bg-purple-600/20 text-purple-500'
              },
              {
                title: 'Community',
                desc: 'Building a supportive environment where aspirants can learn and grow together.',
                icon: Heart,
                color: 'bg-red-600/20 text-red-500'
              },
              {
                title: 'Transparency',
                desc: 'Open and honest communication with our users about our platform and goals.',
                icon: Eye,
                color: 'bg-indigo-600/20 text-indigo-500'
              }
            ].map((value, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${value.color}`}>
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-50 rounded-[3rem] p-12 md:p-20 text-center space-y-8">
          <h2 className="text-4xl font-black text-slate-900">Built for Aspirants, by Aspirants</h2>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            JK Examify is a passion project born out of the need for better digital tools in the local exam ecosystem. We are constantly working to improve the platform and add more features to help you succeed.
          </p>
        </div>
      </section>
    </div>
  );
}
