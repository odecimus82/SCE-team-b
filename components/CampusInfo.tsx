
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { CampusInfoSection } from '../types';

const CampusInfo: React.FC = () => {
  const [sections, setSections] = useState<CampusInfoSection[]>([]);

  useEffect(() => {
    setSections(storageService.getCampusData());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
      <div className="text-center space-y-8 max-w-5xl mx-auto">
        <div className="inline-block px-6 py-2 bg-gray-900 text-sky-400 text-sm font-black rounded-full uppercase tracking-[0.2em] mb-4">
          SCE Team Exclusive Guide
        </div>
        <h2 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none">
          不仅仅是办公区，更是 <span className="text-sky-500">艺术殿堂</span>
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed font-medium max-w-4xl mx-auto">
          华为“溪流背坡村”（Ox Horn Village）占地1900亩。SCE Team 将通过 7.8 公里的红色复古轨道，巡航 12 个风格迥异的欧洲小镇。
          从牛津的哥特之美到巴黎的奥斯曼繁华，这不仅是一场研发总部的巡礼，更是对世界建筑史的致敬。
        </p>
      </div>

      <div className="space-y-48 pt-20">
        {sections.map((section, idx) => (
          <CampusSection key={idx} section={section} idx={idx} />
        ))}
      </div>

      <div className="bg-sky-50 rounded-[2.5rem] p-12 text-center border-2 border-sky-100">
        <p className="text-gray-500 text-sm font-medium italic">
          * 提示：园区实行工牌准入制，家属入园需由员工统一带领。成人随行家属餐饮请现场通过华为食堂系统结算（支持微信支付）。
        </p>
      </div>
    </div>
  );
};

const CampusSection: React.FC<{ section: CampusInfoSection; idx: number }> = ({ section, idx }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}>
      <div className="w-full lg:w-3/5 relative group">
        <div className="absolute -inset-4 bg-sky-400 rounded-[2rem] lg:rounded-[3.5rem] -z-10 transform rotate-1 opacity-20 group-hover:rotate-0 transition-transform"></div>
        <div className="rounded-[2rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl border-4 lg:border-8 border-white aspect-video relative bg-slate-200">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
               <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img 
            src={section.image} 
            alt={section.title}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transform group-hover:scale-110 transition-all duration-[3000ms] ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/1200x800/111827/0EA5E9?text=${encodeURIComponent(section.title)}`;
              setLoaded(true);
            }}
          />
        </div>
      </div>
      <div className="w-full lg:w-2/5 space-y-8 lg:space-y-10 text-left">
        <div className="space-y-4">
          <span className="text-sky-500 font-black text-xs tracking-[0.4em] uppercase">Insight {idx + 1}</span>
          <h3 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight">{section.title}</h3>
        </div>
        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed font-medium">{section.description}</p>
        <div className="grid grid-cols-1 gap-4">
          {section.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 lg:gap-5 text-gray-800 p-4 lg:p-6 bg-white rounded-[1.2rem] lg:rounded-[1.5rem] shadow-sm border-2 border-gray-100 hover:border-sky-500 transition-colors">
              <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 font-black text-lg">
                {i + 1}
              </span>
              <span className="font-black text-lg lg:text-xl">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusInfo;
