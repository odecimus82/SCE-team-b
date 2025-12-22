import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { CampusInfoSection } from '../types';

const CampusInfo: React.FC = () => {
  const [sections, setSections] = useState<CampusInfoSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await storageService.fetchCampusData();
      setSections(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">加载云端指南...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 space-y-8 sm:space-y-12">
      <div className="text-center space-y-2 sm:space-y-4 max-w-4xl mx-auto">
        <div className="inline-block px-3 py-1 bg-gray-900 text-sky-400 text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest">
          SCE Team Exclusive Guide
        </div>
        <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
          不仅仅是办公区，更是 <span className="text-sky-500 underline decoration-sky-100 decoration-8 underline-offset-4">艺术殿堂</span>
        </h2>
        <p className="text-xs sm:text-base text-gray-600 font-medium">
          横跨 12 个欧洲名城风格，7.8 公里红色轨道。巡航溪村，致敬经典。
        </p>
      </div>

      <div className="space-y-8 sm:space-y-16">
        {sections.map((section, idx) => (
          <CampusSection key={idx} section={section} idx={idx} />
        ))}
      </div>

      <div className="bg-sky-50 rounded-xl p-4 sm:p-8 text-center border border-sky-100 mt-4">
        <p className="text-gray-500 text-[9px] sm:text-xs font-medium">
          * 注意事项：入园需持工牌或预约信息，家属餐饮需现场结算（支持微信）。
        </p>
      </div>
    </div>
  );
};

const CampusSection: React.FC<{ section: CampusInfoSection; idx: number }> = ({ section, idx }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-4 sm:gap-10 items-center`}>
      <div className="w-full lg:w-1/2">
        <div className="rounded-xl overflow-hidden shadow-md border-2 border-white aspect-video relative bg-slate-200">
          {!loaded && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}
          <img 
            src={section.image} 
            alt={section.title}
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      </div>
      <div className="w-full lg:w-1/2 space-y-3 text-left">
        <div className="space-y-0.5">
          <span className="text-sky-500 font-black text-[9px] tracking-widest uppercase">Insight {idx + 1}</span>
          <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">{section.title}</h3>
        </div>
        <p className="text-[11px] sm:text-base text-gray-600 leading-snug">{section.description}</p>
        <div className="grid grid-cols-2 gap-2">
          {section.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 font-black text-[10px]">
                {i + 1}
              </span>
              <span className="font-bold text-[10px] sm:text-xs lg:text-sm text-gray-800">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusInfo;