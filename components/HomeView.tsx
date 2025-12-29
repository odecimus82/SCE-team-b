
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration, AppConfig } from '../types';
import { EVENT_DETAILS, CAMPUS_ZONES, TRAIN_LINES } from '../constants';

interface Props {
  onRegister: () => void;
  onExplore: () => void;
  onEdit: () => void;
}

const HomeView: React.FC<Props> = ({ onRegister, onExplore, onEdit }) => {
  const [currentCount, setCurrentCount] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [ownReg, setOwnReg] = useState<Registration | null>(null);
  const [config, setConfig] = useState<AppConfig>({ isRegistrationOpen: true, deadline: Date.now() + 86400000, maxCapacity: 28 });

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
  const hasOwnReg = !!ownReg;
  const progressPercent = Math.min((currentCount / config.maxCapacity) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-3 sm:py-6 lg:py-10 space-y-12 overflow-x-hidden">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 items-center">
        <div className="space-y-3 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center lg:justify-start">
            <div className="bg-gray-900 text-white px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-widest uppercase">
              CORSAIR (SCE) / 2026.01.10
            </div>
            {isDeadlinePassed ? (
              <div className="px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black bg-red-600 text-white">报名截止</div>
            ) : isBlockedByAdmin ? (
              <div className="px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black bg-amber-500 text-white">暂停报名</div>
            ) : (
              <div className="px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black border bg-green-50 border-green-200 text-green-700">火热报名中</div>
            )}
          </div>
          
          <div className="space-y-0.5">
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-gray-900 leading-[0.8] tracking-tighter uppercase">
              CORSAIR<br />
              <span className="text-white bg-sky-500 px-2 py-0.5 inline-block transform -rotate-1 mt-1 scale-90 sm:scale-100 origin-left">DONGGUAN</span>
            </h1>
          </div>

          {/* 状态反馈卡片：已报名 or 立即报名 */}
          {hasOwnReg ? (
            <div className="bg-white border-2 border-green-500 p-5 rounded-3xl shadow-xl shadow-green-50 text-left max-w-lg mx-auto lg:mx-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-[10px] font-black rounded-bl-xl">报名成功</div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{ownReg.name}，已为您预留名额</h4>
                  <p className="text-xs text-gray-500 font-medium">总人数：{1 + (ownReg.adultFamilyCount || 0) + (ownReg.childFamilyCount || 0)} 位（包含随行家属）</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={onEdit} className="text-[10px] font-black text-sky-500 border border-sky-100 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-all uppercase">修改预约信息</button>
                    <button onClick={() => window.scrollTo({top: document.getElementById('plan-detail')?.offsetTop || 0, behavior: 'smooth'})} className="text-[10px] font-black text-gray-500 border border-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all uppercase">查看游玩方案</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-2xl shadow-sm text-left max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/></svg>
                <span className="text-[10px] sm:text-xs font-black text-amber-800 uppercase tracking-widest">集合提醒</span>
              </div>
              <p className="text-sm sm:text-base text-amber-900 font-bold">集合点：<span className="underline">溪流背坡村 F区 南一门</span></p>
              <p className="text-[10px] sm:text-xs text-amber-700 mt-1">需在 <span className="font-black">09:30</span> 准时集合，全员到齐后整体入园。</p>
            </div>
          )}

          <div className="max-w-xs mx-auto lg:mx-0 space-y-1">
            <div className="flex justify-between text-[8px] sm:text-[10px] font-black text-gray-700 uppercase tracking-widest">
              <span>全团已报名人数</span>
              <span>{currentCount} / {config.maxCapacity}</span>
            </div>
            <div className="h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden p-0.5">
              <div className="h-full rounded-full transition-all duration-1000 bg-sky-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start pt-2">
            {!hasOwnReg && (
              <button onClick={onRegister} disabled={!canAct} className={`w-full sm:w-auto px-10 py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-sky-100 ${ canAct ? 'bg-sky-500 text-white hover:bg-sky-600 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                {isDeadlinePassed ? '报名已截止' : '立即预约名额'}
              </button>
            )}
            <button onClick={() => window.scrollTo({top: document.getElementById('plan-detail')?.offsetTop || 0, behavior: 'smooth'})} className="w-full sm:w-auto bg-white border-2 border-gray-900 px-6 py-4 rounded-xl font-black text-lg hover:bg-gray-900 hover:text-white transition-all shadow-md">
              游玩全攻略
            </button>
          </div>
        </div>

        <div className="relative order-1 lg:order-2 px-4 sm:px-0">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
            <img src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80" alt="Campus" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-black uppercase tracking-tight">Ox Horn Village</h3>
              <p className="text-xs text-sky-300 font-bold uppercase tracking-widest">华为东莞松山湖 · 欧洲小镇</p>
            </div>
          </div>
        </div>
      </div>

      {/* PDF & 注意事项内容汇总板块 */}
      <div id="plan-detail" className="pt-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="h-1.5 w-20 bg-sky-500 mx-auto rounded-full"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase tracking-tighter">2026 Corsair SCM Team 游玩方案</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-2xl mx-auto italic">“时光的列车载着我们驶向 2026 年，增强部门凝聚力，于 1月10日 以家庭为单位共赏欧陆风情。”</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 左侧：PDF 园区简介 & 交通 */}
          <div className="md:col-span-2 space-y-6">
            {/* 12个区域列表 */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">12</div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase">园区区域分布</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Architecture Zones</p>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {CAMPUS_ZONES.map(zone => (
                  <div key={zone.id} className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-200 transition-all group">
                    <span className="text-sky-500 font-black text-sm group-hover:scale-125 transition-transform">{zone.id}区</span>
                    <span className="text-[10px] font-bold text-gray-600 mt-1">{zone.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 火车交通 */}
            <div className="bg-gray-900 text-white rounded-[2rem] p-6 sm:p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-lg font-black uppercase">园区交通：红色小火车</h3>
                   <p className="text-[10px] text-sky-400 font-bold uppercase">8:00 - 18:30 | 10分钟一趟</p>
                 </div>
                 <svg className="w-8 h-8 text-sky-500 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
               </div>
               <div className="space-y-4">
                 {TRAIN_LINES.map(line => (
                   <div key={line.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                     <div className="flex items-center gap-3 mb-1">
                       <span className="text-xs font-black bg-sky-500 px-2 py-0.5 rounded uppercase">{line.id}号线</span>
                     </div>
                     <p className="text-xs font-bold text-gray-300 tracking-[0.2em]">{line.route.split('').join(' → ')}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* 右侧：注意事项卡片 (您要求的文字内容) */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6 sticky top-20">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-red-600 uppercase">1/10 游玩注意事项</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Important Rules</p>
              </div>
              
              <div className="space-y-5">
                {[
                  { icon: '🛡️', title: '人身安全', desc: '以家庭为单位，各自负责自家人员（尤其是儿童）的游玩安全。' },
                  { icon: '🍱', title: '吃饭问题', desc: '园内自行解决。有华为食堂, KFC, 咖啡厅等，支持微信/支付宝支付。' },
                  { icon: '🚫', title: '办公区域须知', desc: '严禁进入办公区域，禁止大声喧哗，文明游览。' },
                  { icon: '📍', title: '禁止随意出园', desc: '中途请勿走出园区，一旦走出将无法再次预约进入。' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="space-y-0.5">
                      <p className="font-black text-sm text-gray-900 uppercase">{item.title}</p>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-50">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Emergency Call</p>
                    <p className="text-lg font-black text-gray-900">0769 28250120</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm border border-gray-100">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部装饰图片或提示 */}
        <div className="bg-sky-500 rounded-[3rem] p-10 text-center text-white space-y-4">
          <h4 className="text-2xl font-black uppercase tracking-tight">准备好开启 2026 的第一场旅行了吗？</h4>
          <p className="text-sky-100 font-medium opacity-80">期待在溪流背坡村 F区 与每一位同事及家属相见！</p>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
