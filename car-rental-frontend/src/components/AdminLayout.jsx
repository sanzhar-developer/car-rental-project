import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const links = [
    { to: '/admin', label: 'Статистика', icon: '📊' },
    { to: '/admin/cars', label: 'Автопарк', icon: '🚗' },
    { to: '/admin/bookings', label: 'Бронирования', icon: '📅' },
    { to: '/admin/categories', label: 'Категории', icon: '📁' },
    { to: '/admin/penalties', label: 'Штрафы', icon: '⚠️' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin/users', label: 'Пользователи', icon: '👥' }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0b0b14] flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 flex flex-col sticky top-0 h-screen bg-[#0b0b14]/50 backdrop-blur-3xl z-50">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-600/30 group-hover:rotate-12 transition-transform">🏎️</div>
            <span className="text-xl font-black text-white tracking-tighter">AUTORENT <span className="text-indigo-500 italic">AD</span></span>
          </Link>
        </div>

        <nav className="flex-grow p-6 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4 mb-4">Меню управления</p>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`admin-sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs uppercase tracking-widest">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black">
                {user?.role === 'ADMIN' ? 'A' : 'M'}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 leading-none mb-1">
                  {user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                </span>
                <span className="text-[11px] font-bold text-white truncate w-32">{user?.email}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              Выйти из системы
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow relative">
        {/* Top Header Placeholder / Blur Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <div className="p-12">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
