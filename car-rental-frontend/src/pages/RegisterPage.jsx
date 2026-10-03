import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[0-9]/g, '');
    setFormData({ ...formData, fullName: value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phoneNumber: value });
  };

  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      digit: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };
  };

  const passwordReqs = validatePassword(formData.password);
  const strengthScore = Object.values(passwordReqs).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.phoneNumber.length < 10) {
      toast.error('Номер телефона должен содержать 10 цифр');
      return;
    }

    if (strengthScore < 5) {
      toast.error('Пароль слишком слабый! Выполните все требования.');
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `+7${formData.phoneNumber}`;
      const data = await authService.register(
        formData.email, 
        formData.password, 
        formData.fullName, 
        fullPhoneNumber
      );
      login(data);
      toast.success('Регистрация прошла успешно!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b14] flex items-center justify-center p-6 pt-20 pb-20 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="premium-card p-10 md:p-14">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-xl shadow-indigo-600/20">🏎️</div>
              <span className="text-xl font-black text-white tracking-tighter">AUTORENT</span>
            </Link>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Регистрация</h1>
            <p className="text-slate-500 font-medium italic text-sm">Создайте защищенный аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Полное имя (Ф.И.О)</label>
              <input 
                type="text" 
                required 
                value={formData.fullName}
                onChange={handleNameChange}
                className="input-premium"
                placeholder="Иван Иванов"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Email адрес</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-premium"
                  placeholder="mail@test.kz"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Телефон</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white font-bold text-sm">+7</span>
                  <input 
                    type="tel" 
                    required 
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    className="input-premium pl-12"
                    placeholder="707..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Безопасный пароль</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              
              {/* Password Strength Meter */}
              {formData.password && (
                <div className="px-2 space-y-4 animate-fade-in">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div 
                        key={idx} 
                        className={`flex-1 rounded-full transition-all duration-500 ${
                          idx <= strengthScore 
                            ? strengthScore <= 2 ? 'bg-red-500' : strengthScore <= 4 ? 'bg-orange-500' : 'bg-indigo-500'
                            : 'bg-white/5'
                        }`}
                      ></div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { key: 'length', label: '8+ символов' },
                      { key: 'uppercase', label: 'Заглавная' },
                      { key: 'lowercase', label: 'Строчная' },
                      { key: 'digit', label: 'Цифра' },
                      { key: 'special', label: 'Спецсимвол' },
                    ].map((req) => (
                      <div key={req.key} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordReqs[req.key] ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`}></div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${passwordReqs[req.key] ? 'text-green-500' : 'text-slate-600'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-5 !text-sm mt-4 shadow-indigo-600/10"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Создание...</span>
                </div>
              ) : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs font-medium">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-indigo-400 font-black hover:text-indigo-300 transition-colors uppercase tracking-widest text-[10px] ml-1">
                Войти в систему
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default RegisterPage;

