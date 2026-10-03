import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import carService from '../services/carService';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import useAuthStore from '../store/authStore';
import Loader from '../components/Loader';
import MockPaymentForm from '../components/MockPaymentForm';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/helpers';

// Step 1: Choose dates & rental type
// Step 2: Mock payment
const STEP_FORM = 'form';
const STEP_PAYMENT = 'payment';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(STEP_FORM);
  const [payLoading, setPayLoading] = useState(false);

  // pending booking id after creation (before payment)
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [bookingType, setBookingType] = useState('book'); // 'book' | 'rent'

  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: '',
  });
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await carService.getCarById(id);
        setCar(data);
      } catch {
        toast.error('Автомобиль не найден');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, navigate]);

  const calculateTotal = () => {
    if (!bookingDates.startDate || !bookingDates.endDate) return 0;
    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
    return diffDays * (car?.pricePerDay || 0);
  };

  const deposit = calculateTotal() * 0.2;
  const remaining = calculateTotal() * 0.8;

  const handleBookingTypeSelect = (type) => {
    setBookingType(type);
    if (type === 'rent') {
      setBookingDates(prev => ({ ...prev, startDate: today }));
    }
  };

  // Step 1 submit — create booking, go to payment
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Сначала войдите в систему');
      navigate('/login');
      return;
    }
    if (!privacyPolicyAccepted) {
      toast.error('Необходимо принять условия аренды');
      return;
    }

    setCreateLoading(true);
    try {
      const isInstantRent = bookingType === 'rent';
      const result = await bookingService.createBooking(
        parseInt(id),
        bookingDates.startDate,
        bookingDates.endDate,
        privacyPolicyAccepted,
        isInstantRent
      );
      setPendingBookingId(result.id);
      setStep(STEP_PAYMENT);
    } catch (error) {
      toast.error(error.message || 'Ошибка при создании заявки');
    } finally {
      setCreateLoading(false);
    }
  };

  // Step 2 — mock payment
  const handlePay = async () => {
    setPayLoading(true);
    try {
      await paymentService.payForBooking(pendingBookingId);
      toast.success(
        bookingType === 'rent'
          ? '✅ Оплата прошла! Аренда активна.'
          : '✅ Оплата прошла! Бронь подтверждена.',
        { duration: 5000 }
      );
      navigate('/bookings');
    } catch (error) {
      toast.error(error.message || 'Ошибка оплаты');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!car) return null;

  const canBook = ['AVAILABLE', 'BOOKED'].includes(car.status);

  return (
    <div className="min-h-screen bg-[#0b0b14] pt-32 pb-20">
      <div className="container">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 mb-12 px-2">
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Главная</Link>
          <span className="text-slate-700 text-xs">/</span>
          <Link to="/cars" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Автомобили</Link>
          <span className="text-slate-700 text-xs">/</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{car.brand} {car.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left: Car Info */}
          <div className="lg:col-span-7 space-y-12">
            <div className="premium-card overflow-hidden aspect-video bg-slate-900 group">
              {car.imageUrl ? (
                <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">🚗</div>
              )}
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-4">{car.brand} {car.model}</h1>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl">{car.categoryName}</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl">{car.year} год</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl">{car.licensePlate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Аренда в день</p>
                  <p className="text-4xl font-black text-white leading-none">{formatPrice(car.pricePerDay)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-12 border-y border-white/5">
                {[
                  { l: 'Топливо', v: 'Бензин', i: '⛽' },
                  { l: 'Коробка', v: 'Автомат', i: '⚙️' },
                  { l: 'Мест', v: '5 мест', i: '💺' },
                  { l: 'Кондиционер', v: 'Есть', i: '❄️' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-2xl">{item.i}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.l}</p>
                    <p className="text-sm font-black text-white">{item.v}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white">Описание</h2>
                <p className="text-slate-400 font-medium leading-relaxed italic">
                  Этот {car.brand} {car.model} — не просто средство передвижения, а символ особого стиля и комфорта.
                  Оснащен в отличном техническом состоянии, чистым салоном и всеми необходимыми функциями.
                  Идеальный выбор для любого вашего путешествия или важной встречи.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Booking / Payment Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="premium-card p-10 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[5rem] pointer-events-none"></div>

                {/* ── STEP 1: Booking Form ── */}
                {step === STEP_FORM && (
                  <>
                    <h3 className="text-3xl font-black text-white mb-8">Оформление</h3>

                    {/* Booking type selector */}
                    {canBook && (
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        <button
                          type="button"
                          onClick={() => handleBookingTypeSelect('book')}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            bookingType === 'book'
                              ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <span className="block text-2xl mb-1">📅</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Забронировать</span>
                          <span className="block text-[9px] text-slate-500 mt-1">Предоплата 20%</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBookingTypeSelect('rent')}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            bookingType === 'rent'
                              ? 'bg-green-600/20 border-green-500/50 text-green-300'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <span className="block text-2xl mb-1">🚗</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Взять сейчас</span>
                          <span className="block text-[9px] text-slate-500 mt-1">Сегодня</span>
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleCreateBooking} className="space-y-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Дата получения</label>
                          <input
                            type="date"
                            required
                            min={today}
                            value={bookingDates.startDate}
                            onChange={e => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                            className="input-premium date-input-white"
                            readOnly={bookingType === 'rent'}
                          />
                          {bookingType === 'rent' && (
                            <p className="text-[10px] text-green-400 font-bold ml-2">📍 Дата аренды — сегодня</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Дата возврата</label>
                          <input
                            type="date"
                            required
                            min={bookingDates.startDate || today}
                            value={bookingDates.endDate}
                            onChange={e => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                            className="input-premium date-input-white"
                          />
                        </div>
                      </div>

                      {bookingDates.startDate && bookingDates.endDate && (
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-4 animate-fade-in">
                          <div className="flex justify-between items-center text-sm font-medium text-slate-400">
                            <span>{formatPrice(car.pricePerDay)} × дни</span>
                            <span className="text-white font-black">
                              {Math.ceil(Math.abs(new Date(bookingDates.endDate) - new Date(bookingDates.startDate)) / (1000 * 60 * 60 * 24)) || 1} дн.
                            </span>
                          </div>
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <span>Предоплата (20%):</span>
                              <span className="text-indigo-400">{formatPrice(deposit)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <span>При получении:</span>
                              <span className="text-white">{formatPrice(remaining)}</span>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Итого:</span>
                            <span className="text-2xl font-black text-white">{formatPrice(calculateTotal())}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 px-2">
                        <input
                          type="checkbox"
                          id="policy"
                          required
                          checked={privacyPolicyAccepted}
                          onChange={e => setPrivacyPolicyAccepted(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0"
                        />
                        <label htmlFor="policy" className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider font-bold">
                          Я согласен с <span className="text-indigo-400 cursor-help underline">правилами аренды</span> и штрафами за задержку или повреждение авто
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={createLoading || !canBook}
                        className={`btn-primary w-full py-6 !text-sm ${!canBook ? 'opacity-50 grayscale' : ''}`}
                      >
                        {createLoading ? 'Загрузка...' : !canBook ? 'Недоступно' : bookingType === 'rent' ? 'Арендовать — перейти к оплате' : 'Забронировать — перейти к оплате'}
                      </button>
                    </form>
                  </>
                )}

                {/* ── STEP 2: Mock Payment ── */}
                {step === STEP_PAYMENT && (
                  <>
                    <div className="mb-8">
                      <button
                        onClick={() => setStep(STEP_FORM)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-6"
                      >
                        ← Назад
                      </button>
                      <h3 className="text-3xl font-black text-white">Оплата</h3>
                      <p className="text-slate-400 text-sm mt-2">
                        {bookingType === 'rent' ? '🚗 Аренда сейчас' : '📅 Бронирование'} · {car.brand} {car.model}
                      </p>
                    </div>
                    <MockPaymentForm
                      amount={deposit}
                      onPay={handlePay}
                      onCancel={() => setStep(STEP_FORM)}
                      loading={payLoading}
                    />
                  </>
                )}

                {step === STEP_FORM && (
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">🛡️</div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        Безопасная оплата и <br /> 24/7 поддержка клиентов
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {step === STEP_FORM && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="premium-card p-6 flex flex-col items-center text-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Быстрое подтверждение</p>
                  </div>
                  <div className="premium-card p-6 flex flex-col items-center text-center gap-2">
                    <span className="text-2xl">💎</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Премиум сервис</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
