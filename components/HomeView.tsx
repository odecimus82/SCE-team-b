
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration, AppConfig } from '../types';

interface Props {
  onRegister: () => void;
  onExplore: () => void;
  onEdit: () => void;
}

const HomeView: React.FC<Props> = ({ onRegister, onExplore, onEdit }) => {
  const [currentCount, setCurrentCount] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [ownReg, setOwnReg] = useState<Registration | null>(null);
  const [config, setConfig] = useState<AppConfig>({ isRegistrationOpen: true, deadline: Date.now() + 86400000, maxCapacity: 21 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regs = await storageService.fetchRemoteRegistrations();
        setCurrentCount(storageService.calculateTotalCount(regs));
        
        const reg = await storageService.getOwnRegistration();
        setOwnReg(reg);

        const appConfig = await storageService.fetchConfig();
        setConfig(appConfig);
      } catch (error) {
        console.error("Failed to fetch home view data:", error);
      }
    };

    fetchData();
    const timer = setInterval(() => {
      setNow(Date.now());
      fetchData();
    }, 10000); 
    return () => clearInterval(timer);
  }, []);

  const isDeadlinePassed = now > config.deadline;
  const isBlockedByAdmin = !config.isRegistrationOpen;
  const isFull = currentCount >= config.maxCapacity;
  const canAct = !isDeadlinePassed && !isBlockedByAdmin;
  
  const progressPercent = Math.min((currentCount / config.maxCapacity) * 100, 100);
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
                报名已截止
              </div>
            ) : isBlockedByAdmin ? (
              <div className="px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black bg-amber-500 text-white">
                暂停报名
              </div>
            ) : isFull ? (
              <div className="px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black bg-sky-600 text-white animate-pulse">
                名额已满
              </div>
            ) : (
              <div className="px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black border bg-green-50 border-green-200 text-green-700">
                火热报名中
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
              <span>已报名总人数</span>
              <span>{currentCount} / {config.maxCapacity}</span>
            </div>
            <div className="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden p-0.5 border border-gray-900">
              <div className="h-full rounded-full transition-all duration-1000 bg-sky-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <p className="text-[11px] sm:text-base text-gray-600 max-w-lg mx-auto lg:mx-0 font-medium leading-snug">
            探索华为 <span className="text-gray-900 font-bold underline decoration-sky-400 decoration-2">“溪村”</span> 艺术之巅。<br/>
            截止日期：<span className="font-bold text-gray-900">{new Date(config.deadline).toLocaleString()}</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start pt-2">
            {ownReg ? (
              <button 
                onClick={() => (canEdit && canAct) ? onEdit() : null}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-black text-sm sm:text-lg transition-all shadow-md ${canEdit && canAct ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-100 text-gray-400 cursor-default'}`}
              >
                {(!canAct && canEdit) ? '修改已关闭' : canEdit ? '修改报名' : '已完成报名'}
              </button>
            ) : (
              <button 
                onClick={onRegister}
                disabled={!canAct}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-black text-sm sm:text-lg transition-all shadow-md ${ canAct ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {isDeadlinePassed ? '报名已截止' : isBlockedByAdmin ? '报名暂停中' : isFull ? '名额已满' : '立即预约'}
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
