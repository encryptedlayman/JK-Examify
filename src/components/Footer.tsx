import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                J
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                JK <span className="text-blue-600">Examify</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              The ultimate free mock test platform for JKSSB and SSC aspirants. Practice topic-wise MCQs, track progress, and ace your exams.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/categories" className="hover:text-blue-400 transition-colors">Exam Categories</Link></li>
              <li><Link to="/leaderboard" className="hover:text-blue-400 transition-colors">Global Leaderboard</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">User Dashboard</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Exam Categories</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/category/gk" className="hover:text-blue-400 transition-colors">General Knowledge</Link></li>
              <li><Link to="/category/math" className="hover:text-blue-400 transition-colors">Mathematics</Link></li>
              <li><Link to="/category/english" className="hover:text-blue-400 transition-colors">English Language</Link></li>
              <li><Link to="/category/jk_gk" className="hover:text-blue-400 transition-colors">JK Specific GK</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>support@jkexamify.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>+91 12345 67890</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Jammu & Kashmir, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 JK Examify. All rights reserved. Built for JKSSB & SSC aspirants.</p>
        </div>
      </div>
    </footer>
  );
}
