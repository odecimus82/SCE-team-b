
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
  
  // 仅在已报名且尚未修改过时显示修改按钮
  const canEdit = ownReg && !ownReg.hasEdited;

  // 使用高速 CDN 代理并压缩图片
  const heroImage = `https://images.weserv.nl/?url=${encodeURIComponent('https://images.unsplash.com/photo-1467269204594-9661b134dd2b')}&w=1000&output=webp&q=70`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-24 overflow-x-hidden">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="space-y-8 lg:space-y-10 text-center lg:text-left order-2 lg:order-1">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase border-2 border-gray-800">
              CORSAIR (SCE) / 2026.01.10
            </div>
            {isDeadlinePassed ? (
              <div className="px-4 py-2 rounded-full text-[10px] sm:text-xs font-black bg-red-600 text-white border-2 border-red-700">
                报名已截止
              </div>
            ) : (
              <div className={`px-4 py-2 rounded-full text-[10px] sm:text-xs font-black border-2 ${remaining > 5 ? 'bg-green-100 border-green-700 text-green-700' : 'bg-red-100 border-red-700 text-red-700 animate-pulse'}`}>
                {remaining > 0 ? `当前剩余：${remaining} 位` : '名额已满'}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-gray-900 leading-[0.9] tracking-tighter break-words uppercase">
              CORSAIR (SCE)<br />
              <span className="text-white bg-sky-500 px-3 py-1 inline-block transform -rotate-2 mt-2">DONGGUAN</span>
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-gray-400 italic">Huawei European Campus Expedition</p>
          </div>

          <div className="max-w-md mx-auto lg:mx-0 space-y-3 px-4 sm:px-0">
            <div className="flex justify-between text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest">
              <span>活动报名进度</span>
              <span>{currentCount} / {MAX_CAPACITY}</span>
            </div>
            <div className="h-4 sm:h-6 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-900 p-0.5 sm:p-1">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${remaining < 5 ? 'bg-red-500' : 'bg-sky-500'}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">
              截止时间：2025年12月26日 18:00
            </p>
          </div>

          <div className="px-2 sm:px-0">
            <p className="text-base sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Corsair (SCE) 2026 年度团建启程！我们将深入被各大媒体赞誉的华为 <span className="text-gray-900 font-bold italic underline decoration-sky-500 decoration-4">“溪流背坡村”</span>。
              穿越12个欧洲名城，体验复古红色小火车。
              <br />
              <span className="text-red-500 font-bold block mt-4 text-sm sm:text-base">※ 特别说明：受园区限制，总名额仅 21 人，报满即止。</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start px-4 sm:px-0">
            {ownReg ? (
              canEdit ? (
                <button 
                  onClick={() => window.location.hash = '#edit'}
                  className="w-full sm:w-auto px-10 py-5 sm:px-14 sm:py-6 rounded-2xl font-black text-xl sm:text-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-[0_6px_0_0_#92400e] active:shadow-none active:translate-y-1.5"
                >
                  修改我的报名 (限1次)
                </button>
              ) : (
                <div className="w-full sm:w-auto px-10 py-5 sm:px-14 sm:py-6 rounded-2xl font-black text-xl sm:text-2xl bg-gray-100 text-gray-500 border-2 border-gray-200 cursor-default text-center">
                  已报名 (已修改)
                </div>
              )
            ) : (
              <button 
                onClick={onRegister}
                disabled={remaining <= 0 || isDeadlinePassed}
                className={`w-full sm:w-auto px-10 py-5 sm:px-14 sm:py-6 rounded-2xl font-black text-xl sm:text-2xl transition-all shadow-[0_6px_0_0_#111827] active:shadow-none active:translate-y-1.5 ${
                  (remaining > 0 && !isDeadlinePassed)
                  ? 'bg-sky-500 text-white hover:bg-sky-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isDeadlinePassed ? '报名截止' : remaining > 0 ? '抢位预约' : '名额已满'}
              </button>
            )}
            <button 
              onClick={onExplore}
              className="w-full sm:w-auto bg-white border-4 border-gray-900 px-10 py-5 sm:px-14 sm:py-6 rounded-2xl font-black text-xl sm:text-2xl hover:bg-gray-900 hover:text-white transition-all shadow-[0_6px_0_0_#ccc] active:shadow-none active:translate-y-1.5"
            >
              查看指南
            </button>
          </div>
        </div>

        <div className="relative group order-1 lg:order-2 px-4 sm:px-0 mb-8 lg:mb-0">
          <div className="absolute -inset-2 bg-sky-500 rounded-[2.5rem] lg:rounded-[4rem] blur opacity-10 transition duration-1000 group-hover:opacity-30"></div>
          <div className="relative aspect-[4/3] sm:aspect-[4/5] rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-2xl border-4 sm:border-[12px] border-white transform hover:rotate-1 transition-transform duration-700 bg-gray-100">
            <img 
              src={heroImage} 
              alt="Huawei European Town" 
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 text-white">
              <div className="w-8 sm:w-12 h-1 bg-sky-500 mb-2 sm:mb-4"></div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tighter mb-1 sm:mb-2 uppercase">OX HORN VILLAGE</h3>
              <p className="text-sky-300 font-bold italic tracking-widest text-[10px] sm:text-sm underline decoration-sky-500/50 uppercase">华为东莞研发中心</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
