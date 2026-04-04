import { motion } from 'motion/react';
import { LogIn, ShieldCheck, Zap, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect } from 'react';

export default function Login() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-100"
      >
        {/* Left Side: Branding & Benefits */}
        <div className="hidden lg:flex flex-col justify-center p-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white space-y-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 border-4 border-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-black leading-tight">
              Welcome to <br />
              <span className="text-blue-200">MockTestPro</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-md">
              The ultimate practice platform for JKSSB and SSC aspirants. Join thousands of students today.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {[
              { title: 'Track Progress', icon: Zap, desc: 'Detailed analytics for every test you take.' },
              { title: 'Climb Leaderboard', icon: Trophy, desc: 'Compete with students across the country.' },
              { title: 'Personalized Dashboard', icon: ShieldCheck, desc: 'Save your favorite topics and review weak areas.' },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{benefit.title}</h4>
                  <p className="text-blue-200/80 text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center space-y-10">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Student Login</h2>
            <p className="text-slate-500 font-medium">Get started with your exam preparation journey.</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-4 bg-white border-2 border-slate-100 p-5 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm hover:shadow-xl active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              <span className="text-lg font-bold text-slate-700 group-hover:text-blue-700">Continue with Google</span>
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Secure Access</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
              <div className="flex items-center space-x-3 text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">No password required</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Instant account creation</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Secure data encryption</span>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs leading-relaxed">
            By continuing, you agree to MockTestPro's <br />
            <span className="text-blue-600 font-bold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-blue-600 font-bold hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
