import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0b14] border-t border-white/5 pt-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-600/20">🏎️</div>
              <span className="text-xl font-black text-white tracking-tighter">AUTORENT</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Лучший сервис по аренде автомобилей. С нами ваше путешествие станет еще комфортнее.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Контакты</h3>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Телефон</span>
                <span className="text-sm font-bold text-white">+7 701 234 56 78</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Email</span>
                <span className="text-sm font-bold text-white">info@autorent.kz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-slate-600">© {currentYear} AutoRent. Все права защищены.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-slate-600 hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="text-xs font-bold text-slate-600 hover:text-white transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

