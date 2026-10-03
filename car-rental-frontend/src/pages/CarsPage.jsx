import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import carService from '../services/carService';
import categoryService from '../services/categoryService';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/helpers';

const CarsPage = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carsData, catsData] = await Promise.all([
          carService.getAllCars(),
          categoryService.getAllCategories(),
        ]);
        setCars(carsData);
        setCategories(catsData);
      } catch (error) {
        console.error('Cars load error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = async () => {
    if (filters.startDate && filters.endDate) {
      setLoading(true);
      try {
        const data = await carService.getAvailableCars(filters.startDate, filters.endDate);
        setCars(data);
      } catch (error) {
        console.error('Filter error:', error);
      } finally {
        setLoading(false);
      }
    }
  };


  const filteredCars = cars.filter(car => {
    const matchesCategory = !filters.category || car.categoryId.toString() === filters.category;
    const matchesSearch = !filters.search || 
      car.brand.toLowerCase().includes(filters.search.toLowerCase()) || 
      car.model.toLowerCase().includes(filters.search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading && cars.length === 0) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pt-32 pb-20">
      <div className="container">
        
        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-indigo-500"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Каталог</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tight">Автомобили</h1>
        </div>

        {/* Advanced Filters Bar */}
        <div className="premium-card p-8 mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/10 transition-colors"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Поиск</label>
              <input 
                type="text" 
                placeholder="Модель или бренд..." 
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
                className="input-premium !py-4"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Категория</label>
              <div className="relative">
                <select 
                  value={filters.category}
                  onChange={e => setFilters({...filters, category: e.target.value})}
                  className="input-premium !py-4 cursor-pointer appearance-none"
                >
                  <option value="">Все категории</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Дата получения</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
                className="input-premium !py-4 date-input-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Дата возврата</label>
              <input 
                type="date" 
                min={filters.startDate || new Date().toISOString().split('T')[0]}
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
                className="input-premium !py-4 date-input-white"
              />
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleFilterChange}
                className="btn-primary w-full !py-4 !text-[10px] shadow-indigo-500/10"
                disabled={!filters.startDate || !filters.endDate}
              >
                Проверить наличие
              </button>
            </div>

          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-10 px-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Результаты: <span className="text-white ml-2">{filteredCars.length} автомобилей</span>
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCars.map(car => (
            <div key={car.id} className="premium-card group overflow-hidden animate-fade-in-up">
              <div className="aspect-[16/10] overflow-hidden bg-slate-900 relative">
                {car.imageUrl ? (
                  <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🚗</div>
                )}
                <div className="absolute top-6 left-6 px-4 py-2 bg-[#0b0b14]/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                  {car.categoryName}
                </div>
                <div className={`absolute top-6 right-6 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/5 ${
                  car.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' : 
                  car.status === 'BOOKED' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {car.status === 'AVAILABLE' ? 'Доступен' : 
                   car.status === 'BOOKED' ? 'Забронирован' : 'В аренде'}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b14]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors duration-500">{car.brand} {car.model}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{car.year} год • {car.licensePlate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{formatPrice(car.pricePerDay)}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em]">в день</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{car.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{car.year} год</span>
                  </div>
                </div>

                <Link to={`/cars/${car.id}`} className="btn-secondary w-full group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all duration-700">
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="py-40 text-center premium-card relative overflow-hidden group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-700">🔍</div>
              <h3 className="text-3xl font-black text-white mb-3">Автомобили не найдены</h3>
              <p className="text-slate-500 font-medium italic max-w-md mx-auto">Попробуйте изменить параметры поиска или выбрать другие даты</p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default CarsPage;

