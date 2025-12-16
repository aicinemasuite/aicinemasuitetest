import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { Button } from './Button';

interface AuthScreenProps {
  onLogin: (email: string) => void;
}

interface CustomLink {
  id: string;
  label: string;
  url: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Social Media Links State
  const [socialLinks, setSocialLinks] = useState<{
    fb?: string;
    x?: string;
    insta?: string;
    yt?: string;
    linkedin?: string;
  }>({});
  
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

  useEffect(() => {
    setSocialLinks({
      fb: localStorage.getItem('cinepitch_social_facebook') || "",
      x: localStorage.getItem('cinepitch_social_twitter') || "",
      insta: localStorage.getItem('cinepitch_social_instagram') || "",
      yt: localStorage.getItem('cinepitch_youtube_link') || "",
      linkedin: localStorage.getItem('cinepitch_social_linkedin') || ""
    });

    const savedCustom = localStorage.getItem('cinepitch_custom_social_links');
    if (savedCustom) {
       try {
          setCustomLinks(JSON.parse(savedCustom));
       } catch (e) { console.error("Error loading custom links", e); }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call and Local Validation
    setTimeout(() => {
      setIsLoading(false);
      
      if (showForgotPw) {
         alert("If an account matches that email, a reset link has been sent.");
         setShowForgotPw(false);
         setIsLogin(true);
         return;
      }

      // Check Password (Local Storage)
      const storedPass = localStorage.getItem('cinepitch_user_password') || '123456';
      
      if (password === storedPass) {
         onLogin(email);
      } else {
         alert("Invalid Password. (Hint: Default is 123456)");
      }
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
       setIsLoading(false);
       // Simulate a google user
       onLogin("guest@example.com");
    }, 1000);
  };

  // Beta Feature: Hard Reset
  const handleHardReset = () => {
    if (confirm("⚠️ BETA ACTION: This will clear all local data and reset the app. Use only if the app is stuck. Continue?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const hasAnySocialLink = Object.values(socialLinks).some((link) => typeof link === 'string' && link.length > 0) || customLinks.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Beta Indicator */}
      <div className="absolute top-0 right-0 p-4 z-20">
         <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-amber-400/50">BETA v1.0</span>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 text-amber-500">
            <ICONS.Clapperboard size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 cinematic-font tracking-wider">
            AICINEMA<span className="text-amber-500">SUITE</span>.COM
          </h1>
          <p className="text-zinc-400 text-sm tracking-wide">The Intelligent Production Studio</p>
        </div>

        {showForgotPw ? (
           // FORGOT PASSWORD FLOW
           <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-white font-bold text-lg text-center">Reset Password</h3>
              <p className="text-zinc-400 text-xs text-center mb-4">Enter your email address and we'll send you a link to reset your password.</p>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none pl-10"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <ICONS.User className="absolute left-3 top-3.5 text-zinc-600" size={16} />
                </div>
              </div>
              <Button 
                className="w-full py-3 text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white mt-4"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
              <button 
                 type="button" 
                 onClick={() => setShowForgotPw(false)} 
                 className="w-full text-center text-xs text-zinc-500 hover:text-white mt-2"
              >
                 Cancel and go back to Login
              </button>
           </form>
        ) : (
           // LOGIN / SIGN UP FLOW
           <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none pl-10"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <ICONS.User className="absolute left-3 top-3.5 text-zinc-600" size={16} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none pl-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <ICONS.Settings className="absolute left-3 top-3.5 text-zinc-600" size={16} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center text-zinc-400">
                    <input type="checkbox" className="mr-2 rounded bg-zinc-800 border-zinc-700 text-amber-600 focus:ring-0" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => setShowForgotPw(true)} className="text-amber-500 hover:text-amber-400">Forgot Password?</button>
                </div>

                <Button 
                  className="w-full py-3 text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white mt-4"
                  isLoading={isLoading}
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-950 px-2 text-zinc-500">Or continue with</span></div>
              </div>

              <button 
                 onClick={handleGoogleLogin} 
                 disabled={isLoading}
                 className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-colors text-sm"
              >
                 <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.144 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 C -26.284 47.269 -26.754 49.129 -26.754 51.129 C -26.754 53.129 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.769 C -12.984 43.769 -11.404 44.379 -10.154 45.579 L -6.744 42.169 C -8.804 40.249 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -22.434 46.099 -25.084 43.769 -14.754 43.769 Z"/></g></svg>
                 Sign in with Google
              </button>

              <div className="mt-6 text-center text-xs text-zinc-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-white hover:underline font-medium"
                >
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </div>
           </>
        )}

        {/* SOCIAL LINKS (IF ANY) */}
        {hasAnySocialLink && (
           <div className="mt-8 border-t border-zinc-800 pt-6">
              <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest mb-4 font-bold">Follow Us</p>
              <div className="flex justify-center gap-4 flex-wrap">
                 {socialLinks.fb && (
                    <a href={socialLinks.fb} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-blue-500 transition-colors bg-zinc-900 p-2 rounded-full border border-zinc-800 hover:border-blue-500/50">
                       <ICONS.Facebook size={18} />
                    </a>
                 )}
                 {socialLinks.x && (
                    <a href={socialLinks.x} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full border border-zinc-800 hover:border-white/50">
                       <ICONS.Twitter size={18} />
                    </a>
                 )}
                 {socialLinks.insta && (
                    <a href={socialLinks.insta} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-pink-500 transition-colors bg-zinc-900 p-2 rounded-full border border-zinc-800 hover:border-pink-500/50">
                       <ICONS.Instagram size={18} />
                    </a>
                 )}
                 {socialLinks.yt && (
                    <a href={socialLinks.yt} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-red-600 transition-colors bg-zinc-900 p-2 rounded-full border border-zinc-800 hover:border-red-600/50">
                       <ICONS.Youtube size={18} />
                    </a>
                 )}
                 {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-blue-400 transition-colors bg-zinc-900 p-2 rounded-full border border-zinc-800 hover:border-blue-400/50">
                       <ICONS.Linkedin size={18} />
                    </a>
                 )}
                 {/* Custom Links */}
                 {customLinks.map((link) => (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-zinc-500 hover:text-amber-500 transition-colors bg-zinc-900 p-2 rounded-full border border-zinc-800 hover:border-amber-500/50"
                      title={link.label}
                    >
                       <ICONS.Globe size={18} />
                    </a>
                 ))}
              </div>
           </div>
        )}

        <div className="mt-8 border-t border-zinc-800 pt-6 text-center space-y-4">
           <p className="text-[10px] text-zinc-600">By continuing, you agree to AICINEMASUITE.com Terms of Service & Privacy Policy.</p>
           
           <button 
             onClick={handleHardReset}
             className="text-[10px] text-red-900 hover:text-red-500 uppercase font-bold flex items-center justify-center gap-1 mx-auto transition-colors"
           >
             <ICONS.AlertTriangle size={10} /> App Not Loading? Clear Data
           </button>
        </div>
      </div>
    </div>
  );
};