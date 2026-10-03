import React, { useState, useEffect } from 'react';
import penaltyService from '../services/penaltyService';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/helpers';

const AdminPenaltiesPage = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      const data = await penaltyService.getAllPenalties();
      setPenalties(data);
    } catch (error) {
      console.error('Fetch penalties error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWaive = async (id) => {
    if (!window.confirm('Вы действительно хотите аннулировать этот штраф?')) return;
    try {
      await penaltyService.waivePenalty(id);
      toast.success('Штраф аннулирован');
      fetchPenalties();
    } catch (error) {
      toast.error('Произошла ошибка');
    }
  };


  if (loading && penalties.length === 0) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pb-20">
      <div className="container">
        
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-indigo-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Управление</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tight">Штрафы</h1>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Клиент / Заказ</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Причина</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Сумма</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Дата</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Статус</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {penalties.map(penalty => (
                  <tr key={penalty.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-white">
                        {penalty.userFullName || penalty.clientName || penalty.userName || penalty.clientFullName || penalty.user?.fullName || `Клиент #${penalty.userId}`}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Заказ #{penalty.bookingId}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-400">{penalty.reason}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-red-400">{formatPrice(penalty.amount)}</p>
                    </td>
                    <td className="px-8 py-6 text-slate-400 text-xs font-medium">
                      {new Date(penalty.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        penalty.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 
                        penalty.status === 'UNPAID' ? 'bg-red-500/10 text-red-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {penalty.status === 'PAID' ? 'Оплачено' : 
                         penalty.status === 'UNPAID' ? 'Не оплачено' : 'Аннулировано'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {penalty.status === 'UNPAID' && (
                        <button 
                          onClick={() => handleWaive(penalty.id)} 
                          className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          Аннулировать
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {penalties.length === 0 && !loading && (
          <div className="py-32 text-center premium-card">
            <p className="text-slate-500 font-medium italic">Штрафов пока нет</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPenaltiesPage;

