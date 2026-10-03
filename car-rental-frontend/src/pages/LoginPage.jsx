import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { USER_ROLE } from '../constants/statuses';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [lockoutTime, setLockoutTime] = useState(() => {
    const saved = localStorage.getItem('login_lockout');
    return saved ? parseInt(saved) : null;
  });
  const [timeLeft, setTimeLeft] = useState(0);

  React.useEffect(() => {
    if (!lockoutTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((lockoutTime - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        setLockoutTime(null);
        localStorage.removeItem('login_lockout');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTime && timeLeft > 0) return;
    
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      login(data);
      toast.success('Добро пожаловать!');
      
      if (data.role === USER_ROLE.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error.message?.includes('Too many failed login attempts')) {
        const unlockAt = Date.now() + 15 * 60 * 1000;
        setLockoutTime(unlockAt);
        localStorage.setItem('login_lockout', unlockAt.toString());
        toast.error('Слишком много попыток! Ваш IP временно заблокирован.', {
          duration: 5000,
          icon: '🛡️'
        });
      } else {
        toast.error(error.message || 'Неверный email или пароль');
      }
    } finally {
      setLoading(false);
    }
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };



  return (
    <div className="min-h-screen bg-[#0b0b14] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="premium-card p-12 md:p-16">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shadow-xl shadow-indigo-600/20">🏎️</div>
              <span className="text-2xl font-black text-white tracking-tighter">AUTORENT</span>
            </Link>
            <h1 className="text-4xl font-black text-white mb-4">С возвращением!</h1>
            <p className="text-slate-500 font-medium italic">Введите свои данные для входа</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Email адрес</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium"
                placeholder="example@mail.kz"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Пароль</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || (lockoutTime && timeLeft > 0)}
              className={`btn-primary w-full py-5 !text-sm ${lockoutTime && timeLeft > 0 ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Вход...
                </div>
              ) : lockoutTime && timeLeft > 0 ? (
                <div className="flex items-center justify-center gap-3">
                  🛡️ Заблокировано ({formatTime(timeLeft)})
                </div>
              ) : 'Войти в систему'}
            </button>

          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-indigo-400 font-black hover:text-indigo-300 transition-colors uppercase tracking-widest text-[11px]">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

