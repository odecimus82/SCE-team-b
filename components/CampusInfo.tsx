
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { CampusInfoSection } from '../types';

const CampusInfo: React.FC = () => {
  const [sections, setSections] = useState<CampusInfoSection[]>([]);

  useEffect(() => {
    setSections(storageService.getCampusData());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 space-y-8 sm:space-y-12">
      <div className="text-center space-y-4 sm:space-y-6 max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1.5 bg-gray-900 text-sky-400 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-[0.2em]">
          SCE Team Exclusive Guide
        </div>
        <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">
          不仅仅是办公区，更是 <span className="text-sky-500">艺术殿堂</span>
        </h2>
        <p className="text-sm sm:text-lg text-gray-600 leading-relaxed font-medium max-w-3xl mx-auto px-4">
          SCE Team 将通过 7.8 公里的红色复古轨道，巡航 12 个风格迥异的欧洲小镇，体验世界建筑之美。
        </p>
      </div>

      <div className="space-y-12 sm:space-y-20 pt-4 sm:pt-8">
        {sections.map((section, idx) => (
          <CampusSection key={idx} section={section} idx={idx} />
        ))}
      </div>

      <div className="bg-sky-50 rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 text-center border-2 border-sky-100 mt-8">
        <p className="text-gray-500 text-[10px] sm:text-xs font-medium italic">
          * 提示：园区实行工牌准入制，家属入园需由员工统一带领。成人餐饮请通过华为食堂结算。
        </p>
      </div>
    </div>
  );
};

const CampusSection: React.FC<{ section: CampusInfoSection; idx: number }> = ({ section, idx }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 sm:gap-12 lg:gap-16 items-center px-2 sm:px-4`}>
      <div className="w-full lg:w-3/5 relative group">
        <div className="absolute -inset-1.5 sm:-inset-2 bg-sky-400 rounded-xl sm:rounded-[2.5rem] -z-10 transform rotate-1 opacity-20 group-hover:rotate-0 transition-transform"></div>
        <div className="rounded-xl sm:rounded-[2rem] overflow-hidden shadow-xl border-2 sm:border-4 border-white aspect-video relative bg-slate-200">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
               <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img 
            src={section.image} 
            alt={section.title}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-[2000ms] ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/1200x800/111827/0EA5E9?text=${encodeURIComponent(section.title)}`;
              setLoaded(true);
            }}
          />
        </div>
      </div>
      <div className="w-full lg:w-2/5 space-y-4 sm:space-y-6 text-left">
        <div className="space-y-1.5 sm:space-y-2">
          <span className="text-sky-500 font-black text-[10px] tracking-[0.4em] uppercase">Insight {idx + 1}</span>
          <h3 className="text-2xl lg:text-4xl font-black text-gray-900 leading-tight">{section.title}</h3>
        </div>
        <p className="text-sm sm:text-lg text-gray-600 leading-relaxed font-medium">{section.description}</p>
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {section.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4 text-gray-800 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:border-sky-500 transition-colors">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 font-black text-xs sm:text-sm">
                {i + 1}
              </span>
              <span className="font-black text-sm sm:text-base lg:text-lg">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusInfo;
