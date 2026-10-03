import React, { useState, useEffect } from 'react';
import penaltyService from '../services/penaltyService';
import Loader from '../components/Loader';
import MockPaymentForm from '../components/MockPaymentForm';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/helpers';

const PenaltiesPage = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment modal state
  const [payModal, setPayModal] = useState(null); // { id, amount, reason }
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    fetchMyPenalties();
  }, []);

  const fetchMyPenalties = async () => {
    try {
      const data = await penaltyService.getMyPenalties();
      setPenalties(data);
    } catch (error) {
      console.error('Fetch penalties error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (penalty) => {
    setPayModal({ id: penalty.id, amount: penalty.amount, reason: penalty.reason });
  };

  const handlePay = async () => {
    if (!payModal) return;
    setPayLoading(true);
    try {
      await penaltyService.payPenalty(payModal.id);
      toast.success('✅ Штраф оплачен! Автомобиль возвращен в каталог.', { duration: 5000 });
      setPayModal(null);
      fetchMyPenalties();
    } catch (error) {
      toast.error(error.message || 'Ошибка при оплате');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading && penalties.length === 0) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pt-32 pb-20">
      <div className="container">

        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-red-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Мой аккаунт</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tight">Мои штрафы</h1>
        </div>

        {/* Unpaid alert banner */}
        {penalties.some(p => p.status === 'UNPAID') && (
          <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-black text-red-400">У вас есть неоплаченные штрафы</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                Оплатите штрафы, чтобы автомобиль вернулся в каталог и был доступен для следующего бронирования.
              </p>
            </div>
          </div>
        )}

        {/* Penalty Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {penalties.map(penalty => (
            <div key={penalty.id} className="premium-card p-10 group relative overflow-hidden">
              {penalty.status === 'UNPAID' && (
                <div className="absolute top-0 right-0 w-2 h-full bg-red-500 rounded-r-3xl"></div>
              )}

              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                    {penalty.status === 'UNPAID' ? '⚖️' : '✅'}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    penalty.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
                    penalty.status === 'UNPAID' ? 'bg-red-500/10 text-red-500' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    {penalty.status === 'PAID' ? 'Оплачено' :
                     penalty.status === 'UNPAID' ? 'Не оплачено' : 'Аннулировано'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white mb-2">{penalty.reason}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Заказ #{penalty.bookingId}</p>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Сумма</p>
                    <p className="text-3xl font-black text-red-400">{formatPrice(penalty.amount)}</p>
                  </div>
                  {penalty.status === 'UNPAID' && (
                    <button
                      onClick={() => openPayModal(penalty)}
                      className="btn-primary !px-8 !py-3 !text-[10px]"
                    >
                      Оплатить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {penalties.length === 0 && !loading && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 border border-white/10">🛡️</div>
            <h3 className="text-2xl font-black text-white mb-2">Штрафов нет</h3>
            <p className="text-slate-500 font-medium italic">Вы — примерный водитель!</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !payLoading && setPayModal(null)}></div>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-[3rem] w-full max-w-lg relative z-20 shadow-2xl animate-fade-in-up">
            <div className="p-10 md:p-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-white">Оплата штрафа</h2>
                <button onClick={() => !payLoading && setPayModal(null)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
              <p className="text-sm text-slate-400 mb-8 font-medium">{payModal.reason}</p>
              <MockPaymentForm
                amount={payModal.amount}
                onPay={handlePay}
                onCancel={() => setPayModal(null)}
                loading={payLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenaltiesPage;
