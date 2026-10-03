import React from 'react';
import { CAR_STATUS_LABELS, BOOKING_STATUS_LABELS, PENALTY_STATUS_LABELS } from '../constants/statuses';

const STATUS_STYLES = {
  
  AVAILABLE:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  RENTED:      { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
  BOOKED:      { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20' },
  POPULAR:     { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20' },
  IN_PROGRESS: { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/20' },
  INSPECTION:  { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20' },
  PENALTY:     { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
  
  
  PENDING:     { bg: 'bg-slate-500/10',   text: 'text-slate-400',   border: 'border-slate-500/20' },
  CONFIRMED:   { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20' },
  ACTIVE:      { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  COMPLETED:   { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/20' },
  CANCELLED:   { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },

  PAID:        { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  UNPAID:      { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
  WAIVED:      { bg: 'bg-slate-500/10',   text: 'text-slate-400',   border: 'border-slate-500/20' },
};

const StatusBadge = ({ status, type = 'car' }) => {
  let label = status;
  if (type === 'car')     label = CAR_STATUS_LABELS[status] || status;
  else if (type === 'booking') label = BOOKING_STATUS_LABELS[status] || status;
  else if (type === 'penalty') label = PENALTY_STATUS_LABELS[status] || status;

  const style = STATUS_STYLES[status] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text', 'bg')}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
