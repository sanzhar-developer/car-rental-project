import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

import useAuthStore from '../store/authStore';

const AdminCategoriesPage = () => {
  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData.name, formData.description);
        toast.success('Категория успешно обновлена');
      } else {
        await categoryService.createCategory(formData.name, formData.description);
        toast.success('Новая категория добавлена');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить эту категорию?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Удалено');
      fetchCategories();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };


  if (loading && categories.length === 0) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pb-20">
      <div className="container">
        
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-indigo-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Управление</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-none tracking-tight">Категории</h1>
          </div>
          {!isManager && (
            <button onClick={() => handleOpenModal()} className="btn-primary">
              + Новая категория
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(cat => (
            <div key={cat.id} className="premium-card p-10 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-[4rem] group-hover:bg-indigo-600/10 transition-colors duration-500"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                  📁
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">{cat.name}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                    {cat.description || 'Описание отсутствует'}
                  </p>
                </div>
                  {!isManager ? (
                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => handleOpenModal(cat)} 
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                      >
                        <svg className="w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Изменить
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)} 
                        className="w-12 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-600 italic font-medium w-full text-center py-3 bg-white/[0.02] rounded-xl border border-white/5">Только просмотр</span>
                  )}
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-[#1a1a2e] border border-white/10 rounded-[3rem] w-full max-w-xl relative z-20 shadow-2xl animate-fade-in-up p-10 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-white">{editingCategory ? 'Редактировать' : 'Новая категория'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Название</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="input-premium" 
                    placeholder="Например: SUV, Sedan"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Описание</label>
                  <textarea 
                    rows="4"
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="input-premium resize-none" 
                    placeholder="Кратко о категории..."
                  ></textarea>
                </div>

                <div className="pt-6">
                  <button type="submit" className="btn-primary w-full py-5">
                    {editingCategory ? 'Обновить' : 'Добавить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCategoriesPage;

