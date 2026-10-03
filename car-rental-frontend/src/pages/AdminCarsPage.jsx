import React, { useState, useEffect } from 'react';
import carService from '../services/carService';
import categoryService from '../services/categoryService';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/helpers';
import { CAR_STATUS, CAR_STATUS_LABELS } from '../constants/statuses';
import adminService from '../services/adminService';
import bookingService from '../services/bookingService';
import useAuthStore from '../store/authStore';

// Statuses a manager can SET after inspection (not all statuses)
const MANAGER_ALLOWED_STATUSES = ['AVAILABLE', 'INSPECTION', 'DAMAGED', 'PENALTY'];
// Statuses that require inspection result (car just returned)
const INSPECTION_RESULT_STATUSES = ['AVAILABLE', 'DAMAGED', 'PENALTY'];

const AdminCarsPage = () => {
  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER';
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Inspection Modal state
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspectionCar, setInspectionCar] = useState(null);
  const [inspectionStatus, setInspectionStatus] = useState('');
  const [damageFine, setDamageFine] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    pricePerDay: '',
    categoryId: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [carsData, catsData] = await Promise.all([
        adminService.getAllCars().catch(() => []),
        categoryService.getAllCategories().catch(() => []),
      ]);
      


      const extractData = (data) => {
        if (!data) return [];
        // If it's already an array, use it
        if (Array.isArray(data)) return data;
        // If it's a Page object from Spring (common)
        if (data.content && Array.isArray(data.content)) return data.content;
        // If it's wrapped in a data property
        if (data.data && Array.isArray(data.data)) return data.data;
        // If it's an object, look for any array property (fallback)
        const possibleArray = Object.values(data).find(val => Array.isArray(val));
        if (possibleArray) return possibleArray;
        
        return [];
      };


      const finalCars = extractData(carsData);
      const finalCats = extractData(catsData);

      setCars(finalCars);
      setCategories(finalCats);
      
      if (finalCats.length === 0) {
        console.warn('⚠️ Список категорий пуст! Проверьте базу данных.');
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Ошибка при связи с сервером');
    } finally {
      setLoading(false);
    }
  };



  const handleOpenModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        licensePlate: car.licensePlate,
        pricePerDay: car.pricePerDay,
        categoryId: car.categoryId,
        imageUrl: car.imageUrl || '',
      });
    } else {
      setEditingCar(null);
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        pricePerDay: '',
        categoryId: categories[0]?.id || '',
        imageUrl: '',
      });
    }
    setIsModalOpen(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // License plate validation (Format: 123 AAA 01)
    const plateRegex = /^\d{3}\s[A-ZА-Я]{3}\s\d{2}$/;
    if (!plateRegex.test(formData.licensePlate.toUpperCase())) {
      toast.error('Неверный формат гос. номера! Пример: 123 AAA 01');
      return;
    }

    // Convert strings to numbers for backend compatibility
    const submissionData = {
      ...formData,
      licensePlate: formData.licensePlate.toUpperCase(),
      year: parseInt(formData.year),
      pricePerDay: parseFloat(formData.pricePerDay),
      categoryId: parseInt(formData.categoryId)
    };

    if (isNaN(submissionData.pricePerDay) || !submissionData.categoryId) {
      toast.error('Пожалуйста, заполните цену и выберите категорию');
      return;
    }

    try {
      if (editingCar) {
        await carService.updateCar(editingCar.id, submissionData);
        toast.success('Автомобиль успешно обновлен');
      } else {
        await carService.createCar(submissionData);
        toast.success('Новый автомобиль добавлен');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Произошла ошибка при сохранении');
    }
  };

  const handlePlateChange = (e) => {
    // Remove all spaces to process raw string
    const raw = e.target.value.toUpperCase().replace(/\s/g, '');
    
    // Segment 1: 3 Digits
    let s1 = raw.substring(0, 3).replace(/\D/g, '');
    
    // Segment 2: 3 Letters (Starts only if s1 is full)
    let s2 = '';
    if (raw.length > 3) {
      s2 = raw.substring(3, 6).replace(/[^A-ZА-Яa-zа-я]/g, '');
    }
    
    // Segment 3: 2 Digits (Starts only if s2 is full)
    let s3 = '';
    if (raw.length > 6) {
      s3 = raw.substring(6, 8).replace(/\D/g, '');
    }
    
    let formatted = s1;
    if (s2) formatted += ' ' + s2;
    if (s3) formatted += ' ' + s3;
    
    setFormData({ ...formData, licensePlate: formatted.substring(0, 11) });
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit for Base64
        toast.error('Файл слишком большой! Максимум 2МБ');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
        toast.success('Изображение загружено');
      };
      reader.readAsDataURL(file);
    }
  };



  const handleDelete = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить этот автомобиль?')) return;
    try {
      await carService.deleteCar(id);
      toast.success('Автомобиль удален');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };


  const handleStatusUpdate = async (id, status) => {
    if (status === 'DAMAGED' || status === 'PENALTY') {
      const car = cars.find(c => c.id === id);
      setInspectionCar(car);
      setInspectionStatus(status);
      setDamageFine(0);
      setIsInspectionModalOpen(true);
      return;
    }

    try {
      await adminService.updateCarStatus(id, status);
      toast.success(`Статус успешно обновлен на: ${CAR_STATUS_LABELS[status] || status}`);
      fetchData();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.message || 'Ошибка при обновлении статуса');
    }
  };

  const submitInspection = async (e) => {
    e.preventDefault();
    if (!inspectionCar || !inspectionStatus) return;
    
    setUpdatingStatus(true);
    try {
      await bookingService.completeInspection(inspectionCar.id, inspectionStatus, damageFine);
      toast.success('Результаты осмотра сохранены');
      setIsInspectionModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Ошибка при сохранении результатов');
    } finally {
      setUpdatingStatus(false);
    }
  };


  const filteredCars = cars.filter(car => {
    const statusLabel = CAR_STATUS_LABELS[car.status] || car.status;
    const matchesSearch = 
      car.brand.toLowerCase().includes(filter.toLowerCase()) || 
      car.model.toLowerCase().includes(filter.toLowerCase()) ||
      car.licensePlate.toLowerCase().includes(filter.toLowerCase()) ||
      statusLabel.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === '' || car.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && cars.length === 0) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pb-20">
      <div className="container">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-indigo-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Управление</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-none tracking-tight">Автопарк</h1>
          </div>
          {!isManager && (
            <button onClick={() => handleOpenModal()} className="btn-primary">
              + Новый автомобиль
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow relative">
            <input 
              type="text" 
              placeholder="Поиск (бренд, модель, номер, статус)..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="input-premium pl-14"
            />
            <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-premium md:w-64 appearance-none cursor-pointer"
          >
            <option value="">Все статусы</option>
            {Object.values(CAR_STATUS).map(status => (
              <option key={status} value={status}>{CAR_STATUS_LABELS[status] || status}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            {filteredCars.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Автомобиль</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Номер</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Цена (в день)</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Статус</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCars.map(car => (
                    <tr key={car.id} className="hover:bg-white/[0.02] transition-colors group">

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-800 overflow-hidden border border-white/5 relative group/img">
                          {car.imageUrl ? (
                            <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🚗</div>
                          )}
                          {car.isPopular && (
                            <div className="absolute top-0 left-0 bg-purple-500 text-white text-[6px] font-black uppercase px-1 rounded-br-md shadow-lg">
                              POPULAR
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-white">{car.brand} {car.model}</p>
                            {car.isPopular && <span className="text-[10px]" title="Популярный автомобиль">🔥</span>}
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{car.categoryName} • {car.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono font-bold text-slate-300">
                        {car.licensePlate}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="font-black text-indigo-400">{formatPrice(car.pricePerDay)}</p>
                        {car.originalPrice && car.originalPrice !== car.pricePerDay && (
                          <p className="text-[10px] font-bold text-slate-600 line-through decoration-red-500/50">
                            {formatPrice(car.originalPrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        {/* Manager: can only set inspection result statuses */}
                        {isManager && car.status !== 'INSPECTION' ? (
                          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            car.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500' :
                            car.status === 'BOOKED' ? 'bg-blue-500/10 text-blue-500' :
                            car.status === 'RENTED' ? 'bg-orange-500/10 text-orange-500' :
                            car.status === 'DAMAGED' ? 'bg-red-500/10 text-red-500' :
                            car.status === 'PENALTY' ? 'bg-red-500/20 text-red-600' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            {CAR_STATUS_LABELS[car.status] || car.status}
                          </span>
                        ) : (
                          <select
                            value={car.status}
                            onChange={(e) => handleStatusUpdate(car.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none outline-none cursor-pointer transition-all duration-300 ${
                              car.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' :
                              car.status === 'BOOKED' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' :
                              car.status === 'RENTED' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' :
                              car.status === 'INSPECTION' ? 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20' :
                              car.status === 'DAMAGED' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' :
                              'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                            }`}
                          >
                            {(isManager ? MANAGER_ALLOWED_STATUSES : Object.keys(CAR_STATUS)).map(statusKey => (
                              <option key={statusKey} value={statusKey} className="bg-[#1a1a2e] text-white">
                                {CAR_STATUS_LABELS[statusKey]}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {!isManager ? (
                          <>
                            <button onClick={() => handleOpenModal(car)} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(car.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic font-medium">Только просмотр</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : null}
          </div>
        </div>

        {filteredCars.length === 0 && !loading && (
          <div className="py-24 text-center premium-card">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔍</div>
            <h3 className="text-xl font-black text-white mb-2">Автомобили не найдены</h3>
            <p className="text-slate-500 font-medium italic mb-8">Попробуйте изменить параметры поиска или фильтры</p>
            <button 
              onClick={() => { setFilter(''); setStatusFilter(''); }}
              className="px-8 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              Сбросить все фильтры
            </button>
          </div>
        )}


        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-[#1a1a2e] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-20 shadow-2xl animate-fade-in-up">
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-white">{editingCar ? 'Редактировать' : 'Новое авто'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Бренд</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.brand} 
                        onChange={e => setFormData({...formData, brand: e.target.value})} 
                        className="input-premium" 
                        placeholder="Например: Toyota"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Модель</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.model} 
                        onChange={e => setFormData({...formData, model: e.target.value})} 
                        className="input-premium" 
                        placeholder="Например: Camry"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Год выпуска</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.year} 
                        onChange={e => setFormData({...formData, year: e.target.value})} 
                        className="input-premium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Гос. номер</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.licensePlate} 
                        onChange={handlePlateChange} 
                        className="input-premium" 
                        placeholder="777 AAA 01"
                        maxLength={11}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Цена в день</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.pricePerDay} 
                        onChange={e => setFormData({...formData, pricePerDay: e.target.value})} 
                        className="input-premium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Категория</label>
                      <select 
                        required
                        value={formData.categoryId} 
                        onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                        className="input-premium appearance-none"
                      >
                        {categories.length > 0 ? (
                          <>
                            <option value="">Выберите категорию</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </>
                        ) : (
                          <option value="">⚠️ Сначала создайте категорию</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Изображение (URL или файл)</label>
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={formData.imageUrl.startsWith('data:') ? 'Файл выбран' : formData.imageUrl} 
                          onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                          className="input-premium flex-grow" 
                          placeholder="https://example.com/car.jpg"
                        />
                        <input 
                          type="file" 
                          id="car-image" 
                          hidden 
                          accept="image/*" 
                          onChange={handleFileChange}
                        />
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('car-image').click()}
                          className="btn-secondary whitespace-nowrap !px-6"
                        >
                          ОБЗОР
                        </button>
                      </div>
                    </div>

                    {formData.imageUrl && (
                      <div className="w-full h-48 rounded-2xl overflow-hidden border border-white/5 bg-slate-900 group relative">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, imageUrl: ''})}
                          className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <button type="submit" className="btn-primary w-full py-5">
                      {editingCar ? 'Обновить' : 'Добавить'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Inspection Modal */}
        {isInspectionModalOpen && inspectionCar && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !updatingStatus && setIsInspectionModalOpen(false)}></div>
            <div className="bg-[#1a1a2e] border border-white/10 rounded-[3rem] w-full max-w-lg relative z-20 shadow-2xl animate-fade-in-up">
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white">Результат осмотра</h2>
                  <button onClick={() => !updatingStatus && setIsInspectionModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="mb-8 space-y-2">
                  <p className="text-sm font-bold text-slate-400">Автомобиль: <span className="text-white">{inspectionCar.brand} {inspectionCar.model}</span></p>
                  <p className="text-sm font-bold text-slate-400">Устанавливаемый статус: <span className="text-indigo-400 font-black uppercase tracking-widest">{CAR_STATUS_LABELS[inspectionStatus]}</span></p>
                </div>

                <form onSubmit={submitInspection} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Сумма ущерба / Штрафа (тг)</label>
                    <input 
                      type="number" 
                      required 
                      value={damageFine} 
                      onChange={e => setDamageFine(e.target.value)} 
                      className="input-premium" 
                      placeholder="Введите сумму"
                      min="0"
                    />
                    <p className="text-[10px] text-slate-500 italic mt-2 ml-2">Сумма будет выставлена пользователю как штраф.</p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsInspectionModalOpen(false)} disabled={updatingStatus} className="btn-secondary w-full py-4 text-xs">Отмена</button>
                    <button type="submit" disabled={updatingStatus} className="btn-primary w-full py-4 text-xs">
                      {updatingStatus ? 'Сохранение...' : 'Подтвердить'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCarsPage;

