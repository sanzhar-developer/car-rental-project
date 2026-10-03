import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import Loader from '../components/Loader';
import MockPaymentForm from '../components/MockPaymentForm';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/helpers';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [payModal, setPayModal] = useState(null); 
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Вы действительно хотите отменить это бронирование?')) return;
    try {
      await bookingService.cancelBooking(id);
      toast.success('Бронирование отменено');
      fetchMyBookings();
    } catch {
      toast.error('Ошибка при отмене');
    }
  };

  const openPayModal = (booking, isRemaining = false) => {
    const amount = isRemaining ? booking.totalPrice * 0.8 : booking.totalPrice * 0.2;
    setPayModal({ id: booking.id, amount, isRemaining });
  };

  const handlePay = async () => {
    if (!payModal) return;
    setPayLoading(true);
    try {
      if (payModal.isRemaining) {
        await paymentService.payRemaining(payModal.id);
      } else {
        await paymentService.payForBooking(payModal.id);
      }
      toast.success('✅ Оплата прошла успешно!', { duration: 5000 });
      setPayModal(null);
      fetchMyBookings();
    } catch (error) {
      toast.error(error.message || 'Ошибка при оплате');
    } finally {
      setPayLoading(false);
    }
  };

  const statusConfig = {
    PENDING:   { label: 'Ожидает оплаты',    color: 'bg-slate-500/10 text-slate-400' },
    CONFIRMED: { label: 'Забронировано',      color: 'bg-blue-500/10 text-blue-400' },
    BOOKED:    { label: 'Забронировано',      color: 'bg-blue-500/10 text-blue-400' },
    ACTIVE:    { label: 'В процессе аренды',  color: 'bg-orange-500/10 text-orange-400' },
    COMPLETED: { label: 'Завершено',          color: 'bg-green-500/10 text-green-400' },
    CANCELLED: { label: 'Отменено',           color: 'bg-red-500/10 text-red-400' },
  };

  if (loading && bookings.length === 0) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pt-32 pb-20">
      <div className="container">

        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-indigo-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Мой аккаунт</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tight">Мои бронирования</h1>
        </div>

        {/* Booking Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {bookings.map(booking => {
            const st = statusConfig[booking.status] || { label: booking.status, color: 'bg-white/5 text-white' };
            return (
              <div key={booking.id} className="premium-card p-10 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[4rem] pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                  <div className="space-y-6 flex-grow">
                    <div className="space-y-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${st.color}`}>
                        {st.label}
                      </span>
                      <h3 className="text-3xl font-black text-white">{booking.carBrand} {booking.carModel}</h3>
                    </div>

                    {booking.discountMessage && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
                        <span className="text-xl">🎁</span>
                        <p className="text-[11px] font-bold text-green-400">{booking.discountMessage}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Дата получения</p>
                        <p className="text-sm font-bold text-slate-200">{booking.startDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Дата возврата</p>
                        <p className="text-sm font-bold text-slate-200">{booking.endDate}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Предоплата (20%):</p>
                        <p className="text-sm font-bold text-indigo-400">{formatPrice(booking.totalPrice * 0.2)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Остаток при получении:</p>
                        <p className="text-sm font-bold text-white">{formatPrice(booking.totalPrice * 0.8)}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Итого:</p>
                        <p className="text-xl font-black text-white">{formatPrice(booking.totalPrice)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-6 min-w-[120px]">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-700 shadow-xl border border-white/5">
                      🏎️
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => openPayModal(booking)}
                          className="btn-primary !px-4 !py-3 !text-[10px] w-full"
                        >
                          ОПЛАТИТЬ 20%
                        </button>
                      )}
                      {(booking.status === 'CONFIRMED' || booking.status === 'BOOKED') && (booking.isDepositOnly !== false && booking.payment?.isDepositOnly !== false) && (
                        <button
                          onClick={() => openPayModal(booking, true)}
                          className="btn-primary !px-4 !py-3 !text-[10px] w-full !bg-green-600 shadow-green-600/20 animate-pulse"
                        >
                          ОПЛАТИТЬ ОСТАТОК (80%)
                        </button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn-secondary !px-4 !py-3 !text-[10px] w-full hover:!bg-red-500/10 hover:!text-red-500 hover:!border-red-500/20"
                        >
                          ОТМЕНИТЬ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {bookings.length === 0 && !loading && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 border border-white/10">📅</div>
            <h3 className="text-2xl font-black text-white mb-2">Бронирований пока нет</h3>
            <p className="text-slate-500 font-medium italic mb-8">Самое время начать путешествие!</p>
            <Link to="/cars" className="btn-primary">Выбрать автомобиль</Link>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !payLoading && setPayModal(null)}></div>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-[3rem] w-full max-w-lg relative z-20 shadow-2xl animate-fade-in-up">
            <div className="p-10 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white">Оплата брони</h2>
                <button onClick={() => !payLoading && setPayModal(null)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
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

export default BookingsPage;
