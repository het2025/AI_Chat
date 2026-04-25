import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';

const PatelAILogo = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="48" fill="currentColor" fillOpacity="0.15" />
    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="4" />
    <path 
      d="M50 30V70M30 50H70" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
  </svg>
);

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    inviteCode: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 characters";

    if (!isLogin) {
      if (!formData.fullName) newErrors.fullName = "Full name is required";
      if (!formData.inviteCode) newErrors.inviteCode = "Invitation code is required";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    console.log("Attempting Auth...");
    
    if (!validate()) {
      console.log("Validation failed", errors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    setMessage(null);

    try {
      if (isLogin) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        console.log("Login Success", data.user);
        if (onAuthSuccess) onAuthSuccess(data.user);
      } else {
        // --- 1. VERIFY INVITE CODE ---
        console.log("Checking invite code:", formData.inviteCode);
        const { data: codeData, error: codeError } = await supabase
          .from('invite_codes')
          .select('*')
          .eq('code', formData.inviteCode.trim())
          .single();

        if (codeError || !codeData) {
          throw new Error("Invalid access code. Please check again.");
        }

        if (codeData.uses >= codeData.max_uses) {
          throw new Error("This access code has reached its usage limit.");
        }

        // --- 2. SIGN UP ---
        console.log("Registering user...");
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            }
          }
        });
        
        if (error) throw error;
        
        console.log("Signup Response:", data);

        // --- 3. INCREMENT CODE USES (Background) ---
        supabase
          .from('invite_codes')
          .update({ uses: codeData.uses + 1 })
          .eq('id', codeData.id)
          .then(({error}) => { if(error) console.warn("Code usage update failed:", error.message); });

        if (data.user && data.session) {
           console.log("Signup + Login Success");
           if (onAuthSuccess) onAuthSuccess(data.user);
        } else {
           console.log("Signup success, awaiting email confirm");
           setMessage({ type: 'success', text: "Account created! CHECK YOUR EMAIL to confirm before signing in." });
           // Switch to login mode so they can sign in after confirming
           setTimeout(() => setIsLogin(true), 3000);
        }
      }
    } catch (err) {
      console.error("Critical Auth Error:", err.message);
      setErrors({ auth: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err) {
      setErrors({ auth: err.message });
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col selection:bg-[#D97757]/30 text-[#1A1A1A] font-sans">
      <style>{`
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-gradient { background: linear-gradient(-45deg, #D97757, #C96442, #4338ca, #D97757); background-size: 400% 400%; animation: gradientShift 15s ease infinite; }
        .error-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-white rounded-xl shadow-sm border border-gray-100">
            <PatelAILogo size={24} className="text-[#D97757]" />
          </div>
          <span className="text-xl font-bold tracking-tight">PatelAI</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col md:flex-row">
        {/* Left Panel */}
        <div className="hidden md:flex md:w-[45%] lg:w-[50%] animate-gradient relative overflow-hidden items-center justify-center p-12 lg:p-20">
          <div className="relative z-10 w-full max-w-lg text-white">
            <div className="mb-16">
              <h1 className="text-5xl font-extrabold mb-6 leading-tight">Private Intelligence.</h1>
              <p className="text-xl text-white/90 font-medium leading-relaxed">
                Join a selected circle of creators. Entry is restricted to verified access code holders.
              </p>
            </div>
            <div className="space-y-4">
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                  <div className="font-bold text-lg mb-1 text-white">🔒 Secure Access</div>
                  <div className="text-white/70 text-sm">Your data and history are isolated and encrypted.</div>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 ml-8">
                  <div className="font-bold text-lg mb-1 text-white">🚀 Priority Models</div>
                  <div className="text-white/70 text-sm">Unrestricted access to high-tier reasoning engines.</div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[420px]">
            <div className={`bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 transition-all ${isLoading ? 'opacity-80' : ''}`}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  {isLogin ? 'Welcome back' : 'Claim Access'}
                </h2>
                <p className="text-gray-500 font-medium text-sm">
                  {isLogin ? 'Sign in to your private account.' : 'Create an account using your invitation code.'}
                </p>
              </div>

              {message && (
                <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm font-bold animate-pulse">
                  {message.text}
                </div>
              )}

              {errors.auth && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold error-shake">
                  {errors.auth}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Access Code</label>
                      <input 
                        type="text" 
                        placeholder="🔑 EX: PATEL-BETA"
                        className={`w-full px-4 py-3.5 bg-gray-50 border ${errors.inviteCode ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#D97757] transition-all font-bold text-xs uppercase tracking-widest`}
                        value={formData.inviteCode}
                        onChange={(e) => setFormData({...formData, inviteCode: e.target.value.toUpperCase()})}
                      />
                      {errors.inviteCode && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.inviteCode}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        className={`w-full px-4 py-3.5 bg-gray-50 border ${errors.fullName ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#D97757] transition-all font-medium text-sm`}
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                      {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.fullName}</p>}
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="name@email.com"
                    className={`w-full px-4 py-3.5 bg-gray-50 border ${errors.email ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#D97757] transition-all font-medium text-sm`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
                    {isLogin && <button type="button" className="text-[10px] font-bold text-[#D97757] hover:underline">Forgot?</button>}
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3.5 bg-gray-50 border ${errors.password ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#D97757] transition-all font-medium text-sm`}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
                </div>

                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className={`w-full px-4 py-3.5 bg-gray-50 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-[#D97757] transition-all font-medium text-sm`}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                    {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword}</p>}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#D97757] hover:bg-[#C96442] active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#D97757]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Verifying...</span>
                    </div>
                  ) : (isLogin ? 'Sign In' : 'Create Private Account')}
                </button>
              </form>

              <div className="mt-8 mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-100"></div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Private Beta</span>
                <div className="h-px flex-1 bg-gray-100"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <button onClick={() => handleSocialLogin('google')} className="py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-xs font-bold text-gray-600">Google</button>
                <button onClick={() => handleSocialLogin('github')} className="py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-xs font-bold text-gray-600">GitHub</button>
              </div>
            </div>

            <p className="text-center mt-8 text-gray-500 font-medium text-sm">
              {isLogin ? "Authorized creator?" : "Already a member?"}
              <button onClick={toggleAuthMode} className="ml-2 font-black text-[#D97757] hover:underline transition-all">
                {isLogin ? 'Claim Access' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
