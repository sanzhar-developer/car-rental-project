import React from 'react';
import StatusBadge from './StatusBadge';
import { formatDate, formatPrice } from '../utils/helpers';
import { PENALTY_STATUS } from '../constants/statuses';

const PenaltyCard = ({ penalty, onPay }) => {
  const canPay = penalty.status === PENALTY_STATUS.UNPAID;

  return (
    <div className="card flex flex-col p-5 gap-4"
      style={{ borderLeft: canPay ? '3px solid rgba(248,113,113,0.5)' : '3px solid rgba(52,211,153,0.3)' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Айыппұл</h3>
          <p className="text-xs text-gray-600 mt-0.5">Тапсырыс #{penalty.bookingId}</p>
        </div>
        <StatusBadge status={penalty.status} type="penalty" />
      </div>

      {/* Details */}
      <div className="space-y-2.5">
        {[
          { label: 'Себебі', value: penalty.reason, highlight: false },
          { label: 'Кешіккен күндер', value: `${penalty.daysLate} күн`, highlight: true },
          { label: 'Жасалған күні', value: formatDate(penalty.createdAt), highlight: false },
          ...(penalty.paidAt ? [{ label: 'Төленген күні', value: formatDate(penalty.paidAt), green: true }] : []),
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-gray-500">{item.label}</span>
            <span className={`font-medium ${item.highlight ? 'text-red-400' : item.green ? 'text-green-400' : 'text-white'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: canPay ? 'rgba(239,68,68,0.08)' : 'rgba(52,211,153,0.06)', border: `1px solid ${canPay ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.12)'}` }}>
        <span className="text-sm font-medium text-gray-400">Айыппұл сомасы</span>
        <span className={`text-2xl font-bold ${canPay ? 'text-red-400' : 'text-green-400'}`}>
          {formatPrice(penalty.amount)}
        </span>
      </div>

      {/* Pay button */}
      {canPay && (
        <button
          id={`pay-penalty-${penalty.id}`}
          onClick={() => onPay(penalty.id)}
          className="btn-primary w-full !py-3"
        >
          Айыппұлды төлеу
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default PenaltyCard;
