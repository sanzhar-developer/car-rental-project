import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { USER_ROLE } from '../constants/statuses';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.MANAGER;

  const userLinks = [
    { to: '/', label: 'Главная' },
    { to: '/cars', label: 'Автомобили' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Статистика' },
    { to: '/admin/cars', label: 'Автопарк' },
    { to: '/admin/bookings', label: 'Бронирования' },
    { to: '/admin/categories', label: 'Категории' },
    { to: '/admin/penalties', label: 'Штрафы' },
  ];

  if (isAuthenticated && !isAdmin) {
    userLinks.push({ to: '/bookings', label: 'Мои заказы' });
    userLinks.push({ to: '/penalties', label: 'Штрафы' });
  }

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'glass-header py-4' : 'bg-transparent py-8'}`}>
      <div className="container flex items-center justify-between">
        
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/"} className="group flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shadow-xl shadow-indigo-600/40 group-hover:rotate-12 transition-transform duration-500">
            🏎️
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter leading-none">AUTORENT</span>
            <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Premium Rental</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 bg-white/[0.03] border border-white/5 px-8 py-3 rounded-2xl backdrop-blur-md">
          {links.map(link => (
            <Link 
              key={link.to} 
              to={link.to} 
              className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative group ${location.pathname === link.to ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-500 transition-transform duration-300 origin-left ${location.pathname === link.to ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></span>
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {user?.role === 'ADMIN' ? 'Админ' : user?.role === 'MANAGER' ? 'Менеджер' : 'Пользователь'}
                </span>
                <span className="text-xs font-bold text-white">{user?.email}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                title="Выйти"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link to="/login" className="text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Войти</Link>
              <Link to="/register" className="btn-primary !py-3 !px-8">Регистрация</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-12 h-12 flex items-center justify-center text-white bg-white/5 rounded-2xl border border-white/10 active:scale-95 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 top-0 bg-slate-950/95 backdrop-blur-2xl transition-all duration-500 z-[90] ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex flex-col h-full p-8 pt-32 space-y-8">
          {links.map((link, idx) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className="text-4xl font-black text-white hover:text-indigo-500 transition-colors"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-8 border-t border-white/5 space-y-6">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="w-full py-6 text-center bg-red-500/10 text-red-400 font-black rounded-[2rem] border border-red-500/20 uppercase tracking-widest text-sm">Выйти</button>
            ) : (
              <>
                <Link to="/login" className="block w-full py-6 text-center text-white border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-sm">Войти</Link>
                <Link to="/register" className="block w-full py-6 text-center bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


