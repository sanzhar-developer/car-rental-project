import React from 'react';
import StatusBadge from './StatusBadge';
import { formatDate, formatPrice } from '../utils/helpers';
import { BOOKING_STATUS } from '../constants/statuses';

const BookingCard = ({ booking, onCancel }) => {
  const canCancel = booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.PENDING;

  return (
    <div className="card group flex flex-col p-5 gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors">
            {booking.carBrand} {booking.carModel}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">Тапсырыс #{booking.id}</p>
        </div>
        <StatusBadge status={booking.status} type="booking" />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Басталуы', value: formatDate(booking.startDate) },
          { label: 'Аяқталуы', value: formatDate(booking.endDate) },
        ].map((d, i) => (
          <div key={i} className="p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-gray-600 mb-1">{d.label}</p>
            <p className="text-sm font-semibold text-white">{d.value}</p>
          </div>
        ))}
      </div>

      {/* Late return */}
      {booking.actualReturnDate && (
        <div className="p-3 rounded-xl"
          style={{ background: booking.isLateReturn ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${booking.isLateReturn ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
          <p className="text-xs text-gray-500 mb-0.5">Нақты қайтару күні</p>
          <p className="text-sm font-semibold text-white">{formatDate(booking.actualReturnDate)}</p>
          {booking.isLateReturn && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">⚠️ Кеш қайтару</p>
          )}
        </div>
      )}

      {/* Price */}
      <div className="space-y-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Негізгі баға</span>
          <span className="text-gray-300">{formatPrice(booking.totalPrice + (booking.discountApplied || 0))}</span>
        </div>
        {booking.discountApplied > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Жеңілдік</span>
            <span className="text-green-400 font-medium">−{formatPrice(booking.discountApplied)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span className="text-white">Жалпы сома</span>
          <span className="gradient-text text-lg">{formatPrice(booking.totalPrice)}</span>
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <button
          id={`cancel-booking-${booking.id}`}
          onClick={() => onCancel(booking.id)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          Бас тарту
        </button>
      )}
    </div>
  );
};

export default BookingCard;
