import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/helpers';

const StatCard = ({ title, value, icon, gradient, trend }) => (
  <div className="premium-card p-8 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-[5rem] -mr-8 -mt-8 group-hover:bg-indigo-500/5 transition-colors duration-500"></div>
    <div className="flex items-start justify-between mb-8">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xl" style={{ background: gradient }}>
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], 
    endDate: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => { 
    fetchData(); 
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) fetchRevenueStats();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStatistics();
      setStats(data);
      await fetchRevenueStats();
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const data = await adminService.getRevenueStatistics(dateRange.startDate, dateRange.endDate);
      setRevenueStats(data);
    } catch (error) {
      console.error('Revenue error:', error);
    }
  };


  if (loading && !stats) return <Loader fullScreen />;

  const sections = [
    {
      title: 'Статус автопарка',
      items: [
        { title: 'Всего машин', value: stats?.totalCars || 0, icon: '🚗', gradient: 'linear-gradient(135deg,#6366f1,#a855f7)' },
        { title: 'Доступно', value: stats?.availableCars || 0, icon: '✨', gradient: 'linear-gradient(135deg,#10b981,#34d399)' },
        { title: 'В аренде', value: stats?.rentedCars || 0, icon: '🔑', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
        { title: 'Забронировано', value: stats?.bookedCars || 0, icon: '📅', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)' },
        { title: 'На проверке', value: stats?.carStatusCount?.inspection || 0, icon: '🔍', gradient: 'linear-gradient(135deg,#a855f7,#6366f1)' },
        { title: 'Повреждено', value: stats?.carStatusCount?.damaged || 0, icon: '🛠️', gradient: 'linear-gradient(135deg,#ef4444,#f87171)' },
        { title: 'Штрафники', value: stats?.carStatusCount?.penalty || 0, icon: '⚠️', gradient: 'linear-gradient(135deg,#f97316,#fb923c)' },
        { title: 'Популярные', value: stats?.carStatusCount?.popular || 0, icon: '🔥', gradient: 'linear-gradient(135deg,#d946ef,#8b5cf6)' },
      ]
    },
    {
      title: 'Аналитика бронирований',
      items: [
        { title: 'Всего заказов', value: stats?.totalBookings || 0, icon: '📊', gradient: 'linear-gradient(135deg,#8b5cf6,#d946ef)' },
        { title: 'Активные', value: stats?.activeBookings || 0, icon: '⚡', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)' },
        { title: 'Завершенные', value: stats?.completedBookings || 0, icon: '✅', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
        { title: 'Отмененные', value: stats?.cancelledBookings || 0, icon: '🚫', gradient: 'linear-gradient(135deg,#ef4444,#f87171)' },
      ]
    },
    {
      title: 'Финансовые показатели',
      items: [
        { title: 'Общий доход', value: formatPrice(stats?.totalRevenue || 0), icon: '💰', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
        { title: 'Штрафы', value: formatPrice(stats?.totalPenalties || 0), icon: '⚠️', gradient: 'linear-gradient(135deg,#f97316,#fb923c)' },
        { title: 'Неоплачено', value: formatPrice(stats?.unpaidPenalties || 0), icon: '💳', gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
        { title: 'Пользователи', value: stats?.totalUsers || 0, icon: '👥', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0b14] pb-20">
      <div className="container">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-indigo-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Управление Админа</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-none tracking-tight">Статистика</h1>
            <p className="text-slate-500 font-medium max-w-lg">
              Отслеживайте и управляйте всеми процессами в системе в режиме реального времени.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: '/admin/cars', label: 'Автомобили', icon: '🚗' },
              { to: '/admin/bookings', label: 'Бронирования', icon: '📅' },
              { to: '/admin/categories', label: 'Категории', icon: '📁' },
              { to: '/admin/penalties', label: 'Штрафы', icon: '⚠️' },
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.to} 
                className="flex flex-col items-center gap-3 p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Sections */}
        <div className="space-y-20">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-700 whitespace-nowrap">{section.title}</h2>
                <div className="w-full h-px bg-white/[0.03]"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {section.items.map((item, i) => (
                  <StatCard key={i} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Analytics Section */}
        <div className="mt-24 premium-card p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/[0.02] to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8 relative z-10">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Аналитика доходов</h2>
              <p className="text-slate-500 font-medium italic">Выберите диапазон дат для просмотра показателей</p>
            </div>
            
            <div className="flex items-center gap-4 bg-[#0b0b14] p-3 rounded-2xl border border-white/10">
              <input 
                type="date" 
                value={dateRange.startDate} 
                onChange={e => setDateRange({...dateRange, startDate: e.target.value})} 
                className="bg-transparent text-white text-[11px] font-black uppercase tracking-widest outline-none px-4 cursor-pointer date-input-white" 
              />
              <span className="text-slate-700 font-black">—</span>
              <input 
                type="date" 
                value={dateRange.endDate} 
                onChange={e => setDateRange({...dateRange, endDate: e.target.value})} 
                className="bg-transparent text-white text-[11px] font-black uppercase tracking-widest outline-none px-4 cursor-pointer date-input-white" 
              />
            </div>
          </div>

          {revenueStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                { l: 'Общий доход', v: formatPrice(revenueStats.totalRevenue), c: 'text-green-400', icon: '💵' },
                { l: 'Скидки', v: formatPrice(revenueStats.totalDiscounts), c: 'text-orange-400', icon: '🏷️' },
                { l: 'Штрафы', v: formatPrice(revenueStats.totalPenalties), c: 'text-red-400', icon: '⚖️' },
                { l: 'Чистая прибыль', v: formatPrice(revenueStats.netRevenue), c: 'text-indigo-400', icon: '📈' },
              ].map((item, i) => (
                <div key={i} className="space-y-4 group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">{item.l}</p>
                  </div>
                  <p className={`text-4xl font-black ${item.c} tracking-tighter`}>{item.v}</p>
                  <div className="w-12 h-1 bg-white/[0.05] group-hover:w-full transition-all duration-700"></div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;


