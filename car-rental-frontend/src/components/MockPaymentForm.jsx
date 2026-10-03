import React, { useState } from 'react';

/**
 * MockPaymentForm — a reusable mock payment form component.
 * Accepts:
 *  - amount: number — the total to display
 *  - onPay: async function — called when the user submits
 *  - onCancel: function — called when the user cancels
 *  - loading: bool
 *  - title: string — modal title
 */
const MockPaymentForm = ({ amount, onPay, onCancel, loading, title = 'Оплата' }) => {
  const [card, setCard] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  });

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPay();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Banner */}
      <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">К оплате</span>
        <span className="text-2xl font-black text-white">
          {new Intl.NumberFormat('ru-RU').format(amount)} ₸
        </span>
      </div>

      {/* Card Number */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Номер карты</label>
        <div className="relative">
          <input
            type="text"
            required
            placeholder="0000 0000 0000 0000"
            value={card.number}
            onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
            className="input-premium pr-12 tracking-widest"
            maxLength={19}
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg">💳</span>
        </div>
      </div>

      {/* Card Holder */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Имя держателя</label>
        <input
          type="text"
          required
          placeholder="IVAN IVANOV"
          value={card.holder}
          onChange={e => setCard({ ...card, holder: e.target.value.toUpperCase() })}
          className="input-premium uppercase tracking-widest"
        />
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Срок действия</label>
          <input
            type="text"
            required
            placeholder="ММ/ГГ"
            value={card.expiry}
            onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
            className="input-premium tracking-widest"
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">CVV</label>
          <input
            type="password"
            required
            placeholder="•••"
            value={card.cvv}
            onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
            className="input-premium tracking-widest"
            maxLength={3}
          />
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
        <span className="text-xl">🔒</span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Безопасная транзакция · SSL шифрование
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary w-full py-4 text-xs">
          Отмена
        </button>
        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-xs">
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Обработка...</span>
            </div>
          ) : 'Оплатить'}
        </button>
      </div>
    </form>
  );
};

export default MockPaymentForm;
