import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const inner = (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '0.6s', animationDirection: 'reverse' }} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Загрузка...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0b0b14]">
        {inner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-24 w-full">
      {inner}
    </div>
  );
};

export default Loader;
