
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { MAX_CAPACITY, REGISTRATION_DEADLINE } from '../constants';
import { Registration } from '../types';

interface Props {
  onRegister: () => void;
  onExplore: () => void;
}

const HomeView: React.FC<Props> = ({ onRegister, onExplore }) => {
  const [currentCount, setCurrentCount] = useState(0);
  const [now, setNow] = useState(Date.now());
  // Fix: ownReg should hold the Registration object (or null), not the initial Promise from the async function
  const [ownReg, setOwnReg] = useState<Registration | null>(null);

  useEffect(() => {
    // Fix: fetch data asynchronously and update state inside useEffect
    const fetchData = async () => {
      try {
        const regs = await storageService.fetchRemoteRegistrations();
        // Fix: Use calculateTotalCount with the fetched registrations as getTotalCount does not exist
        setCurrentCount(storageService.calculateTotalCount(regs));
        
        const reg = await storageService.getOwnRegistration();
        setOwnReg(reg);
      } catch (error) {
        console.error("Failed to fetch home view data:", error);
      }
    };

    fetchData();
    const timer = setInterval(() => {
      setNow(Date.now());
      fetchData();
    }, 10000); // Poll every 10 seconds
    return () => clearInterval(timer);
  }, []);

  const remaining = MAX_CAPACITY - currentCount;
  const isDeadlinePassed = now > REGISTRATION_DEADLINE;
  const progressPercent = (currentCount / MAX_CAPACITY) * 100;
  
  // Fix: ownReg is now correctly typed as Registration | null, so hasEdited property exists
  const canEdit = ownReg && !ownReg.hasEdited;
  const heroImage = `https://wsrv.nl/?url=${encodeURIComponent('https://images.unsplash.com/photo-1467269204594-9661b134dd2b')}&w=800&output=webp&q=70`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-3 sm:py-6 lg:py-10 overflow-x-hidden">
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 items-center">
        <div className="space-y-3 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center lg:justify-start">
            <div className="bg-gray-900 text-white px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-widest uppercase">
              CORSAIR (SCE) / 2026.01.10
            </div>
            {isDeadlinePassed ? (
              <div className="px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black bg-red-600 text-white">
                已截止
              </div>
            ) : (
              <div className={`px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black border ${remaining > 5 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700 animate-pulse'}`}>
                {remaining > 0 ? `剩 ${remaining} 位` : '满员'}
              </div>
            )}
          </div>
          
          <div className="space-y-0.5">
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-gray-900 leading-[0.8] tracking-tighter uppercase">
              CORSAIR<br />
              <span className="text-white bg-sky-500 px-2 py-0.5 inline-block transform -rotate-1 mt-1 scale-90 sm:scale-100 origin-left">DONGGUAN</span>
            </h1>
            <p className="text-xs sm:text-base font-bold text-gray-400 italic mt-1">Huawei European Campus Expedition</p>
          </div>

          <div className="max-w-xs mx-auto lg:mx-0 space-y-1">
            <div className="flex justify-between text-[8px] sm:text-[10px] font-black text-gray-700 uppercase tracking-widest">
              <span>报名进度</span>
              <span>{currentCount}/{MAX_CAPACITY}</span>
            </div>
            <div className="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-900">
              <div className={`h-full rounded-full transition-all duration-1000 ${remaining < 5 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <p className="text-[11px] sm:text-base text-gray-600 max-w-lg mx-auto lg:mx-0 font-medium leading-snug">
            探索华为 <span className="text-gray-900 font-bold underline decoration-sky-400 decoration-2">“溪村”</span> 艺术之巅。
            <span className="text-red-500 font-bold block mt-1 text-[9px] sm:text-xs">※ 仅 21 席。</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start pt-2">
            {ownReg ? (
              <button 
                onClick={() => canEdit ? window.location.hash = '#edit' : null}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-black text-sm sm:text-lg transition-all shadow-md ${canEdit ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-400 cursor-default'}`}
              >
                {canEdit ? '修改报名' : '已报名'}
              </button>
            ) : (
              <button 
                onClick={onRegister}
                disabled={remaining <= 0 || isDeadlinePassed}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-black text-sm sm:text-lg transition-all shadow-md ${ (remaining > 0 && !isDeadlinePassed) ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {isDeadlinePassed ? '截止' : remaining > 0 ? '立即预约' : '满员'}
              </button>
            )}
            <button 
              onClick={onExplore}
              className="w-full sm:w-auto bg-white border-2 border-gray-900 px-6 py-3 rounded-lg font-black text-sm sm:text-lg hover:bg-gray-900 hover:text-white shadow-md active:translate-y-0.5 transition-all"
            >
              查看指南
            </button>
          </div>
        </div>

        <div className="relative order-1 lg:order-2 px-4 sm:px-0">
          <div className="relative aspect-[4/3] rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white bg-gray-100">
            <img src={heroImage} alt="Campus" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 text-white">
              <h3 className="text-base sm:text-2xl font-black uppercase tracking-tight">Ox Horn Village</h3>
              <p className="text-[8px] sm:text-xs text-sky-300 font-bold uppercase tracking-widest">华为东莞研发中心</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
