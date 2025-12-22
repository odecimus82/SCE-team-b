
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { MAX_CAPACITY, REGISTRATION_DEADLINE } from '../constants';

interface Props {
  onRegister: () => void;
  onExplore: () => void;
}

const HomeView: React.FC<Props> = ({ onRegister, onExplore }) => {
  const [currentCount, setCurrentCount] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [ownReg, setOwnReg] = useState(storageService.getOwnRegistration());

  useEffect(() => {
    setCurrentCount(storageService.getTotalCount());
    const timer = setInterval(() => {
      setNow(Date.now());
      setOwnReg(storageService.getOwnRegistration());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = MAX_CAPACITY - currentCount;
  const isDeadlinePassed = now > REGISTRATION_DEADLINE;
  const progressPercent = (currentCount / MAX_CAPACITY) * 100;
  
  const canEdit = ownReg && !ownReg.hasEdited;
  const heroImage = `https://images.weserv.nl/?url=${encodeURIComponent('https://images.unsplash.com/photo-1467269204594-9661b134dd2b')}&w=1000&output=webp&q=70`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 lg:py-12 overflow-x-hidden">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center lg:justify-start">
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-1 rounded-full text-[9px] sm:text-xs font-black tracking-widest uppercase border-2 border-gray-800">
              CORSAIR (SCE) / 2026.01.10
            </div>
            {isDeadlinePassed ? (
              <div className="px-3 py-1 rounded-full text-[9px] sm:text-xs font-black bg-red-600 text-white border-2 border-red-700">
                报名已截止
              </div>
            ) : (
              <div className={`px-3 py-1 rounded-full text-[9px] sm:text-xs font-black border-2 ${remaining > 5 ? 'bg-green-100 border-green-700 text-green-700' : 'bg-red-100 border-red-700 text-red-700 animate-pulse'}`}>
                {remaining > 0 ? `当前剩余：${remaining} 位` : '名额已满'}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-7xl lg:text-9xl font-black text-gray-900 leading-[0.85] tracking-tighter break-words uppercase">
              CORSAIR (SCE)<br />
              <span className="text-white bg-sky-500 px-3 py-1 inline-block transform -rotate-2 mt-1 sm:mt-2 scale-90 sm:scale-100 origin-left">DONGGUAN</span>
            </h1>
            <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-400 italic">Huawei European Campus Expedition</p>
          </div>

          <div className="max-w-md mx-auto lg:mx-0 space-y-1.5 px-4 sm:px-0">
            <div className="flex justify-between text-[9px] sm:text-xs font-black text-gray-900 uppercase tracking-widest">
              <span>报名进度</span>
              <span>{currentCount} / {MAX_CAPACITY}</span>
            </div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-900 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${remaining < 5 ? 'bg-red-500' : 'bg-sky-500'}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase">
              截止：2025年12月26日 18:00
            </p>
          </div>

          <div className="px-2 sm:px-0">
            <p className="text-xs sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              深入华为 <span className="text-gray-900 font-bold italic underline decoration-sky-500 decoration-2">“溪流背坡村”</span>，巡航12个欧洲小镇。
              <span className="text-red-500 font-bold block mt-2 text-[10px] sm:text-sm">※ 特别说明：受园区限制，名额仅 21 人。</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0 pt-2">
            {ownReg ? (
              canEdit ? (
                <button 
                  onClick={() => window.location.hash = '#edit'}
                  className="w-full sm:w-auto px-6 py-3.5 sm:px-12 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-[0_4px_0_0_#92400e] active:shadow-none active:translate-y-1"
                >
                  修改报名
                </button>
              ) : (
                <div className="w-full sm:w-auto px-6 py-3.5 sm:px-12 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl bg-gray-100 text-gray-500 border-2 border-gray-200 cursor-default text-center">
                  已成功报名
                </div>
              )
            ) : (
              <button 
                onClick={onRegister}
                disabled={remaining <= 0 || isDeadlinePassed}
                className={`w-full sm:w-auto px-6 py-3.5 sm:px-12 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl transition-all shadow-[0_4px_0_0_#111827] active:shadow-none active:translate-y-1 ${
                  (remaining > 0 && !isDeadlinePassed)
                  ? 'bg-sky-500 text-white hover:bg-sky-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isDeadlinePassed ? '报名截止' : remaining > 0 ? '立即预约' : '名额已满'}
              </button>
            )}
            <button 
              onClick={onExplore}
              className="w-full sm:w-auto bg-white border-[2px] sm:border-[3px] border-gray-900 px-6 py-3.5 sm:px-12 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl hover:bg-gray-900 hover:text-white transition-all shadow-[0_4px_0_0_#ccc] active:shadow-none active:translate-y-1"
            >
              查看指南
            </button>
          </div>
        </div>

        <div className="relative group order-1 lg:order-2 px-2 sm:px-0 mb-2 lg:mb-0">
          <div className="absolute -inset-1 bg-sky-500 rounded-[1.5rem] lg:rounded-[3rem] blur opacity-10 transition duration-1000 group-hover:opacity-30"></div>
          <div className="relative aspect-[4/3] sm:aspect-[4/5] rounded-[1.5rem] lg:rounded-[3rem] overflow-hidden shadow-xl border-4 sm:border-[8px] border-white transform hover:rotate-1 transition-transform duration-700 bg-gray-100">
            <img 
              src={heroImage} 
              alt="Huawei European Town" 
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-white">
              <div className="w-6 sm:w-10 h-0.5 sm:h-1 bg-sky-500 mb-1.5 sm:mb-2"></div>
              <h3 className="text-lg sm:text-3xl font-black tracking-tighter mb-0.5 uppercase">OX HORN VILLAGE</h3>
              <p className="text-sky-300 font-bold italic tracking-widest text-[8px] sm:text-xs underline decoration-sky-500/50 uppercase">华为东莞研发中心</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
