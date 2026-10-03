import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import carService from '../services/carService';
import categoryService from '../services/categoryService';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/helpers';

const HomePage = () => {
  const [popularCars, setPopularCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cars, cats] = await Promise.all([
          carService.getAllCars(),
          categoryService.getAllCategories(),
        ]);
        setPopularCars(cars.slice(0, 3));
        setCategories(cats);
      } catch (error) {
        console.error('Home data load error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  if (loading) return <Loader fullScreen />;

  return (
    <div className="bg-[#0b0b14] min-h-screen">
      
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-px bg-indigo-500"></span>
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-500">Премиум Автопарк</span>
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter">
                ВАШЕ ПУТЕШЕСТВИЕ <br />
                НА <span className="gradient-text italic">PREMIUM</span> <br />
                УРОВНЕ
              </h1>
            </div>
            
            <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
              Самые современные модели автомобилей, гибкие условия и безупречный сервис. 
              Ваш комфорт — наш главный приоритет.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
              <Link to="/cars" className="btn-primary !px-12 !py-6 !text-sm">
                Посмотреть авто
              </Link>
              <Link to="/register" className="btn-secondary !px-12 !py-6 !text-sm">
                Регистрация
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-12 pt-20 border-t border-white/5">
              {[
                { l: 'Доступных авто', v: '50+' },
                { l: 'Довольных клиентов', v: '10k+' },
                { l: 'Лет опыта', v: '5+' },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-3xl font-black text-white">{stat.v}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{stat.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-full opacity-50 pointer-events-none">
           <div className="relative w-full h-full">
              <div className="absolute top-1/2 left-0 w-full aspect-video bg-gradient-to-r from-indigo-600/20 to-transparent rounded-l-[10rem] blur-3xl"></div>
           </div>
        </div>
      </section>

      <section className="py-32 border-y border-white/5 bg-white/[0.01]">
        <div className="container">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-500">Категории</h2>
              <p className="text-4xl font-black text-white">Выберите подходящий стиль</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link 
                key={cat.id} 
                to={`/cars?category=${cat.id}`}
                className="premium-card p-10 group hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-8 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-500">
                  {i === 0 ? '🏎️' : i === 1 ? '🚙' : i === 2 ? '🚐' : '🚗'}
                </div>
                <h3 className="text-xl font-black text-white mb-2">{cat.name}</h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-2">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container">
          <div className="flex justify-between items-end mb-20">
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-500">Популярное</h2>
              <p className="text-4xl font-black text-white italic tracking-tighter">САМЫЕ <span className="text-indigo-500">ЛУЧШИЕ</span></p>
            </div>
            <Link to="/cars" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-3">
              Смотреть все
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularCars.map(car => (
              <div key={car.id} className="premium-card group overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden bg-slate-900 relative">
                  {car.imageUrl ? (
                    <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🚗</div>
                  )}
                  <div className="absolute top-6 left-6 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {car.categoryName}
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-white">{car.brand} {car.model}</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{car.year} • {car.licensePlate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-indigo-400">{formatPrice(car.pricePerDay)}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">в день</p>
                    </div>
                  </div>
                  <Link to={`/cars/${car.id}`} className="btn-secondary w-full">
                    Подробнее
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

