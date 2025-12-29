
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { CampusInfoSection } from '../types';
import { CAMPUS_ZONES, TRAIN_LINES } from '../constants';

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
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 space-y-12">
      <div className="text-center space-y-2 sm:space-y-4 max-w-4xl mx-auto">
        <div className="inline-block px-3 py-1 bg-gray-900 text-sky-400 text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest">
          SCE Team Exclusive Guide
        </div>
        <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
          全境游玩手册
        </h2>
      </div>

      {/* 12大组团列表 */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-1 text-center sm:text-left border-b pb-6">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">欧洲名城 12 大组团</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Architecture Zones</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CAMPUS_ZONES.map(zone => (
            <div key={zone.id} className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100 hover:border-sky-200 transition-all group">
              <div className="text-lg font-black text-sky-500 group-hover:scale-110 transition-transform">{zone.id}</div>
              <div className="text-[10px] font-bold text-gray-600 mt-1">{zone.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 火车线路 */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-900 text-white rounded-[2.5rem] p-6 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase tracking-tight">红色小火车路线</h3>
            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Retro Tram Routes</p>
          </div>
          <div className="space-y-4">
            {TRAIN_LINES.map(line => (
              <div key={line.id} className="flex gap-4 items-start border-l-2 border-sky-500 pl-4">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-xs shrink-0">{line.id}号线</div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">途经区域</p>
                  <p className="text-sm font-black tracking-widest text-sky-200">{line.route.split('').join(' → ')}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-gray-500 font-medium italic">* 10分钟一趟，请在指定站台等候。</p>
        </div>

        <div className="bg-sky-500 text-white rounded-[2.5rem] p-6 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
             <h3 className="text-xl font-black uppercase tracking-tight">紧急求助电话</h3>
             <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Emergency Services</p>
          </div>
          <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
            <p className="text-4xl font-black tracking-tighter">0769 28250120</p>
            <p className="text-xs font-bold mt-2 text-sky-100">华为欧洲小镇园区安全急救热线</p>
          </div>
        </div>
      </div>

      <div className="space-y-12 pt-8">
        {sections.map((section, idx) => (
          <CampusSection key={idx} section={section} idx={idx} />
        ))}
      </div>
    </div>
  );
};

const CampusSection: React.FC<{ section: CampusInfoSection; idx: number }> = ({ section, idx }) => (
  <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-4 sm:gap-10 items-center`}>
    <div className="w-full lg:w-1/2">
      <div className="rounded-xl overflow-hidden shadow-md border-2 border-white aspect-video bg-slate-200">
        <img src={section.image} alt={section.title} className="w-full h-full object-cover" />
      </div>
    </div>
    <div className="w-full lg:w-1/2 space-y-3 text-left">
      <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">{section.title}</h3>
      <p className="text-[11px] sm:text-base text-gray-600 leading-snug">{section.description}</p>
      <div className="grid grid-cols-2 gap-2">
        {section.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
            <span className="font-bold text-[10px] sm:text-xs lg:text-sm text-gray-800">{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CampusInfo;
