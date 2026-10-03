import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import bookingService from '../services/bookingService';
import penaltyService from '../services/penaltyService';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/helpers';
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from '../constants/statuses';
import useAuthStore from '../store/authStore';

const AdminBookingsPage = () => {
  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states for Complete Booking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actualReturnDate, setActualReturnDate] = useState('');
  const [completing, setCompleting] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let data;
      if (statusFilter) {
        data = await adminService.filterBookingsByStatus(statusFilter);
      } else {
        data = await adminService.getAllBookings();
      }
      setBookings(data);
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleOpenDetail = async (id) => {
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    setBookingDetail(null);
    try {
      const data = await bookingService.getBookingDetailById(id);
      setBookingDetail(data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error(`Не удалось загрузить детали: ${error.message || JSON.stringify(error)}`);
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStartRental = async (id) => {
    if (!window.confirm('Выдать автомобиль клиенту и начать аренду?')) return;
    try {
      await adminService.startRental(id);
      toast.success('Аренда успешно начата!');
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Ошибка при начале аренды');
    }
  };

  const openCompleteModal = (booking) => {
    setSelectedBooking(booking);
    setActualReturnDate(booking.endDate); 
    setIsModalOpen(true);
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !actualReturnDate) return;
    setCompleting(true);
    try {
      const response = await bookingService.completeBooking(selectedBooking.id, actualReturnDate);
      if (response.isLateReturn) {
        toast.error(`ВНИМАНИЕ: Просрочка! Начислен штраф, будущие брони смещены!`, { 
          duration: 6000,
          style: { minWidth: '300px', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold' }
        });
      } else {
        toast.success('Машина принята. Статус: На проверке');
      }
      setIsModalOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Произошла ошибка при завершении');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Вы уверены, что хотите отменить?')) return;
    try {
      await bookingService.cancelBooking(id);
      toast.success('Бронирование отменено');
      fetchBookings();
    } catch (error) {
      toast.error('Произошла ошибка');
    }
  };

  const handleTrafficFine = async (bookingId) => {
    if (!window.confirm('Выписать штраф ГИБДД (100,000 тг) для этого бронирования?')) return;
    try {
      await penaltyService.createTrafficFine(bookingId);
      toast.success('Штраф ГИБДД успешно выписан');
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Ошибка при выписке штрафа');
    }
  };


  if (loading && bookings.length === 0) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pb-20">
      <div className="container">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-indigo-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Управление</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-none">Бронирования</h1>
          </div>
          
          <div className="flex gap-4">
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-premium md:w-64 appearance-none cursor-pointer"
            >
              <option value="">Все статусы</option>
              {Object.values(BOOKING_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Клиент / ID</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Автомобиль</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Даты</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Цена</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Статус</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-white">
                        {booking.userFullName || booking.clientName || booking.userName || booking.clientFullName || booking.user?.fullName || `Пользователь #${booking.userId}`}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {booking.id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-white">{booking.carBrand} {booking.carModel}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID авто: {booking.carId}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">{booking.startDate}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase">с — по</span>
                        <span className="text-xs font-bold text-slate-300">{booking.endDate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-indigo-400">{formatPrice(booking.totalPrice)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        booking.status === 'PENDING' ? 'bg-slate-500/10 text-slate-400' :
                        (booking.status === 'CONFIRMED' || booking.status === 'BOOKED') ? 'bg-blue-500/10 text-blue-500' : 
                        booking.status === 'ACTIVE' ? 'bg-orange-500/10 text-orange-500' :
                        booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenDetail(booking.id)} className="px-4 py-2 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-500 hover:text-white transition-all">
                          Детали
                        </button>
                        {booking.status === 'ACTIVE' && (
                          <>
                            <button onClick={() => handleTrafficFine(booking.id)} className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">
                              Штраф ГИБДД
                            </button>
                            <button onClick={() => openCompleteModal(booking)} className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">
                              Принять авто
                            </button>
                          </>
                        )}
                        {['PENDING', 'CONFIRMED', 'ACTIVE'].includes(booking.status) && !isManager && (
                          <button onClick={() => handleCancel(booking.id)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            Отменить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {bookings.length === 0 && !loading && (
          <div className="py-32 text-center premium-card">
            <p className="text-slate-500 font-medium italic">Бронирований пока нет</p>
          </div>
        )}

        {/* Modal for Actual Return Date */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !completing && setIsModalOpen(false)}></div>
            <div className="bg-[#1a1a2e] border border-white/10 rounded-[3rem] w-full max-w-lg relative z-20 shadow-2xl animate-fade-in-up">
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white">Прием авто</h2>
                  <button onClick={() => !completing && setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="mb-8 space-y-2">
                  <p className="text-sm font-bold text-slate-400">Автомобиль: <span className="text-white">{selectedBooking.carBrand} {selectedBooking.carModel}</span></p>
                  <p className="text-sm font-bold text-slate-400">Ожидаемая дата возврата: <span className="text-indigo-400">{selectedBooking.endDate}</span></p>
                </div>

                <form onSubmit={submitComplete} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Фактическая дата возврата</label>
                    <input 
                      type="date" 
                      required 
                      value={actualReturnDate} 
                      onChange={e => setActualReturnDate(e.target.value)} 
                      className="input-premium date-input-white" 
                    />
                    {actualReturnDate > selectedBooking.endDate && (
                      <p className="text-xs text-red-400 font-bold mt-2 ml-2">
                        ⚠️ Просрочка на {Math.ceil((new Date(actualReturnDate) - new Date(selectedBooking.endDate)) / (1000 * 60 * 60 * 24))} дней. Будет начислен штраф!
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} disabled={completing} className="btn-secondary w-full py-4 text-xs">Отмена</button>
                    <button type="submit" disabled={completing} className="btn-primary w-full py-4 text-xs">
                      {completing ? 'Обработка...' : 'Подтвердить'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Booking Details */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
            <div className="bg-[#1a1a2e] border border-white/10 rounded-[2rem] w-full max-w-2xl relative z-20 shadow-2xl animate-fade-in-up my-8">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-white">Детали бронирования</h2>
                  <button onClick={() => setIsDetailModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                {loadingDetail ? (
                  <div className="flex justify-center py-12"><Loader /></div>
                ) : bookingDetail ? (
                  <div className="space-y-8">
                    {/* User Info */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Информация об арендаторе</h3>
                      <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Полное имя</p>
                          <p className="text-sm font-bold text-white">{bookingDetail.userFullName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Телефон</p>
                          <p className="text-sm font-bold text-white">{bookingDetail.userPhoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Email</p>
                          <p className="text-sm font-bold text-white">{bookingDetail.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">ID Пользователя</p>
                          <p className="text-sm font-bold text-white">#{bookingDetail.userId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">Детали заказа</h3>
                      <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Автомобиль</p>
                          <p className="text-sm font-bold text-white">{bookingDetail.carBrand} {bookingDetail.carModel}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Гос. номер</p>
                          <p className="text-sm font-bold text-white">{bookingDetail.carLicensePlate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Период аренды</p>
                          <p className="text-sm font-bold text-white">{bookingDetail.startDate} — {bookingDetail.endDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Статус</p>
                          <p className="text-sm font-bold text-white">{BOOKING_STATUS_LABELS[bookingDetail.status] || bookingDetail.status}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Общая стоимость</p>
                          <p className="text-sm font-black text-indigo-400">{formatPrice(bookingDetail.totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Примененная скидка</p>
                          <p className="text-sm font-bold text-green-400">{formatPrice(bookingDetail.discountApplied)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500">Данные не найдены</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminBookingsPage;

