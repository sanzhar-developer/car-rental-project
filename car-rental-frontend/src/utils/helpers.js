import { differenceInDays, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd.MM.yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ru });
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const days = differenceInDays(end, start);
  return days > 0 ? days : 0;
};

export const formatPrice = (price) => {
  if (price === undefined || price === null) return '0 ₸';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('KZT', '₸');
};

export const calculateDiscount = (days, pricePerDay, completedBookings, hasLateReturns) => {
  let totalPrice = days * pricePerDay;
  let discount = 0;
  let discountReasons = [];

  if (days > 7) {
    const durationDiscount = totalPrice * 0.20;
    discount += durationDiscount;
    discountReasons.push('Скидка за длительную аренду (7+ дней): 20%');
  }

  if (completedBookings >= 5 && !hasLateReturns) {
    const loyaltyDiscount = totalPrice * 0.10;
    discount += loyaltyDiscount;
    discountReasons.push('Скидка постоянного клиента (6-я аренда): 10%');
  }

  return {
    totalPrice,
    discount,
    finalPrice: totalPrice - discount,
    discountReasons,
  };
};

export const getStatusColor = (status) => {
  const colors = {
    AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    BOOKED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    RENTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    POPULAR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    IN_PROGRESS: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    INSPECTION: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    PENALTY: 'bg-red-500/10 text-red-400 border-red-500/20',
    PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    COMPLETED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    UNPAID: 'bg-red-500/10 text-red-400 border-red-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    WAIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};


