import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import useAuthStore from '../store/authStore';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockNotifications = [
      { id: 1, title: 'Добро пожаловать!', message: 'Добро пожаловать на платформу Midnight Premium. Лучшие автомобили ждут вас.', type: 'INFO', createdAt: new Date().toISOString() },
      { id: 2, title: 'Бронирование подтверждено', message: 'Ваше бронирование на Toyota Camry было подтверждено.', type: 'SUCCESS', createdAt: new Date().toISOString() },
    ];
    
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pt-32 pb-20">
      <div className="container">
        
        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-indigo-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Мой аккаунт</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tight">Уведомления</h1>
        </div>

        {/* List */}
        <div className="max-w-3xl space-y-6">
          {notifications.map(notif => (
            <div key={notif.id} className="premium-card p-8 group relative overflow-hidden transition-all hover:bg-white/[0.03]">
              <div className="flex items-start gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  notif.type === 'SUCCESS' ? 'bg-green-500/10 text-green-500' :
                  notif.type === 'ERROR' ? 'bg-red-500/10 text-red-500' :
                  'bg-indigo-500/10 text-indigo-500'
                }`}>
                  {notif.type === 'SUCCESS' ? '✅' : notif.type === 'ERROR' ? '⚠️' : '🔔'}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-white">{notif.title}</h3>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 font-medium leading-relaxed italic">{notif.message}</p>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 border border-white/10">📭</div>
              <h3 className="text-2xl font-black text-white mb-2">Уведомлений нет</h3>
              <p className="text-slate-500 font-medium italic">Пока всё спокойно</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;

