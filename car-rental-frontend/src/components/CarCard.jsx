import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatPrice } from '../utils/helpers';
import { CAR_STATUS } from '../constants/statuses';

const CarCard = ({ car }) => {
  const isAvailable = car.status === CAR_STATUS.AVAILABLE;

  return (
    <div className="group relative bg-[#151525] border border-white/5 rounded-[32px] overflow-hidden hover:border-primary-500/30 transition-all duration-500 shadow-xl hover:shadow-primary-500/10">
      
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={car.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop&q=80'}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradients & Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151525] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500" />

        {/* Top Badges */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {car.isPopular && (
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl shadow-purple-500/40 backdrop-blur-md border border-white/20 animate-pulse">
                🔥 Популярный
              </span>
            )}
          </div>
          <div className="scale-90 origin-right">
            <StatusBadge status={car.status} type="car" />
          </div>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-5 left-7">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white leading-none">{formatPrice(car.pricePerDay)}</span>
            <span className="text-xs font-bold text-gray-400 mb-1">/ день</span>
          </div>
          {car.originalPrice && car.originalPrice !== car.pricePerDay && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 line-through decoration-red-500/50">{formatPrice(car.originalPrice)}</span>
              <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                {car.pricePerDay < car.originalPrice ? 'Скидка' : 'Спрос'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-black text-white group-hover:text-primary-400 transition-colors truncate">
              {car.brand} {car.model}
            </h3>
            <span className="text-xs font-black text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              {car.year}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {car.categoryName || 'Universal'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-2">
          {isAvailable ? (
            <Link
              to={`/cars/${car.id}`}
              className="flex items-center justify-center gap-3 w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-[0.9375rem] transition-all duration-300 shadow-xl shadow-primary-500/20 active:scale-[0.98]"
            >
              Забронировать
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 text-gray-600 rounded-2xl font-black text-[0.9375rem] border border-white/5">
              Недоступен
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard;
