import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      toast.error(`Ошибка: ${error.message || 'Не удалось загрузить пользователей'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phoneNumber: value });
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        fullName: user.fullName,
        phoneNumber: user.phoneNumber?.replace('+7', '') || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить этого пользователя?')) return;
    try {
      await adminService.deleteUser(id);
      toast.success('Пользователь удален');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  const validatePassword = (password) => {
    if (!password && editingUser) return { length: true, lowercase: true, uppercase: true, digit: true, special: true };
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      digit: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };
  };

  const passwordReqs = validatePassword(formData.password);
  const strengthScore = Object.values(passwordReqs).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.phoneNumber.length < 10) {
      toast.error('Номер телефона должен содержать 10 цифр');
      return;
    }

    if (!editingUser && strengthScore < 5) {
      toast.error('Пароль слишком слабый! Выполните все требования.');
      return;
    }

    setSubmitting(true);
    try {
      const fullPhoneNumber = `+7${formData.phoneNumber}`;
      const submissionData = { ...formData, phoneNumber: fullPhoneNumber };
      
      if (editingUser) {
        // If editing and password is empty, don't send it
        if (!submissionData.password) delete submissionData.password;
        await adminService.updateManager(editingUser.id, submissionData);
        toast.success('Данные обновлены!');
      } else {
        await adminService.createManager(submissionData);
        toast.success('Менеджер создан!');
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Произошла ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && users.length === 0) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-[#0b0b14] pb-20">
      <div className="container">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-indigo-500"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Управление персоналом</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-none tracking-tight">Пользователи</h1>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary">
            + Создать менеджера
          </button>
        </div>

        {/* Users Table */}
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Пользователь</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Контакты</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Роль</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-black text-white">{u.fullName || 'Без имени'}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-300 font-medium">{u.email}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{u.phoneNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                        u.role === 'MANAGER' ? 'bg-indigo-500/10 text-indigo-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {u.role === 'ADMIN' ? 'Админ' : u.role === 'MANAGER' ? 'Менеджер' : 'Клиент'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(u)} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-indigo-600 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button onClick={() => handleDelete(u.id)} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && !loading && (
          <div className="py-20 text-center premium-card">
            <p className="text-slate-500 italic">Пользователей пока нет</p>
          </div>
        )}

        {/* Create/Edit Manager Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)}></div>
            <div className="bg-[#1a1a2e] border border-white/10 rounded-[3rem] w-full max-w-xl relative z-20 shadow-2xl animate-fade-in-up">
              <div className="p-10 md:p-12">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-white">{editingUser ? 'Редактировать' : 'Новый менеджер'}</h2>
                  <button onClick={() => !submitting && setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Полное имя</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Иван Иванов"
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})} 
                        className="input-premium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Телефон</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white font-bold text-sm">+7</span>
                        <input 
                          type="tel" 
                          required 
                          placeholder="707..."
                          value={formData.phoneNumber} 
                          onChange={handlePhoneChange} 
                          className="input-premium pl-12" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="manager@example.com"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="input-premium" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Пароль {editingUser && '(оставьте пустым, чтобы не менять)'}</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required={!editingUser}
                        placeholder="••••••••"
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        className="input-premium pr-12" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>

                    {formData.password && (
                      <div className="px-2 space-y-4 animate-fade-in">
                        <div className="flex gap-1 h-1">
                          {[1, 2, 3, 4, 5].map((idx) => (
                            <div 
                              key={idx} 
                              className={`flex-1 rounded-full transition-all duration-500 ${
                                idx <= strengthScore 
                                  ? strengthScore <= 2 ? 'bg-red-500' : strengthScore <= 4 ? 'bg-orange-500' : 'bg-indigo-500'
                                  : 'bg-white/5'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="btn-secondary w-full py-4 text-xs">Отмена</button>
                    <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-xs uppercase tracking-widest">
                      {submitting ? 'Обработка...' : editingUser ? 'Сохранить' : 'Создать'}
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

export default AdminUsersPage;
