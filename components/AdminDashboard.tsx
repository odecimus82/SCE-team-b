import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration, CampusInfoSection } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [campusData, setCampusData] = useState<CampusInfoSection[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'guide'>('stats');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('offline');

  const refreshData = async () => {
    const regs = await storageService.fetchRemoteRegistrations();
    setRegistrations(regs);
    const guide = await storageService.fetchCampusData();
    setCampusData(guide);
    
    try {
      const res = await fetch('/api/sync');
      setDbStatus(res.ok ? 'connected' : 'offline');
    } catch {
      setDbStatus('offline');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'sce2026') {
      setIsAuthenticated(true);
    } else {
      alert('密码错误！默认密码：sce2026');
    }
  };

  const handleSaveGuide = async () => {
    setIsSaving(true);
    const success = await storageService.saveCampusDataToCloud(campusData);
    if (success) {
      alert('园区指南已成功同步至云端！');
    } else {
      alert('保存失败，请检查网络');
    }
    setIsSaving(false);
  };

  const updateSection = (idx: number, field: keyof CampusInfoSection, value: any) => {
    const newData = [...campusData];
    newData[idx] = { ...newData[idx], [field]: value };
    setCampusData(newData);
  };

  const stats = registrations.reduce((acc, reg) => {
    acc.totalPeople += 1 + (Number(reg.adultFamilyCount) || 0) + (Number(reg.childFamilyCount) || 0);
    acc.employees += 1;
    acc.familyAdults += (Number(reg.adultFamilyCount) || 0);
    acc.children += (Number(reg.childFamilyCount) || 0);
    return acc;
  }, { totalPeople: 0, employees: 0, familyAdults: 0, children: 0 });

  const chartData = [
    { name: '员工', value: stats.employees },
    { name: '家属(大)', value: stats.familyAdults },
    { name: '儿童', value: stats.children },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center space-y-6">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto rotate-3 shadow-lg text-white">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase">管理入口</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="管理员密码" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none text-center font-bold" />
            <button className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg">进入后台</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('stats')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'stats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>报名统计</button>
          <button onClick={() => setActiveTab('guide')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'guide' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>指南编辑</button>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${dbStatus === 'connected' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
          <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
          {dbStatus === 'connected' ? '云端数据库在线' : '离线模式'}
        </div>
      </div>

      {activeTab === 'stats' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '预计到场', value: stats.totalPeople, sub: '总人数', color: 'text-gray-900' },
              { label: '员工数', value: stats.employees, sub: '报名人', color: 'text-sky-500' },
              { label: '大人家属', value: stats.familyAdults, sub: '随行', color: 'text-blue-500' },
              { label: '随行儿童', value: stats.children, sub: '12岁以下', color: 'text-green-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                <p className={`text-3xl font-black my-1 ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 font-bold">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest">数据分布</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 900}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#0ea5e9', '#3b82f6', '#22c55e'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center bg-sky-50 p-4 rounded-2xl border border-sky-100">
                <p className="text-xs font-bold text-sky-700 italic">在此上传图片链接并修改文字，点击“保存并发布”即可更新前台展示。</p>
                <button 
                  disabled={isSaving}
                  onClick={handleSaveGuide} 
                  className="bg-sky-600 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-sky-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? '正在同步...' : '保存并发布到云端'}
                </button>
              </div>

              <div className="grid gap-6">
                {campusData.map((section, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">栏目 {idx + 1}</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">标题</label>
                          <input type="text" value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none font-bold text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">描述文案</label>
                          <textarea rows={3} value={section.description} onChange={e => updateSection(idx, 'description', e.target.value)} className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none font-medium text-xs leading-relaxed" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">图片 URL (下方有推荐图床)</label>
                          <input type="text" value={section.image} onChange={e => updateSection(idx, 'image', e.target.value)} className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none font-mono text-[10px] text-sky-600" />
                          <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                             <img src={section.image} className="w-full h-full object-cover" alt="Preview" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL'; }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">亮点要点 (逗号分隔)</label>
                      <input type="text" value={section.items.join(', ')} onChange={e => updateSection(idx, 'items', e.target.value.split(',').map(s => s.trim()))} className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none font-bold text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 rounded-[2rem] p-6 text-white space-y-4 sticky top-24">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">推荐图床</h3>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">指南图片需要稳定的“外链地址”。推荐以下适合中国网络环境的免费图床：</p>
                <div className="space-y-2">
                  <a href="https://imgtp.com/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 group">
                    <div>
                      <p className="text-xs font-black">路过图床 (ImgTP)</p>
                      <p className="text-[9px] text-gray-500">国内最快、最稳定推荐</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                  <a href="https://www.superbed.cn/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 group">
                    <div>
                      <p className="text-xs font-black">聚合图床 (SuperBed)</p>
                      <p className="text-[9px] text-gray-500">多节点备用、高可用</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                  <a href="https://sm.ms/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 group">
                    <div>
                      <p className="text-xs font-black">SM.MS</p>
                      <p className="text-[9px] text-gray-500">开发者常用、口碑好</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
                <div className="pt-4 border-t border-white/10">
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">操作流程：</p>
                   <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">
                     1. 访问上方任一图床<br/>
                     2. 上传您的园区实拍照片<br/>
                     3. 复制获得的 <span className="text-sky-400">直链 URL</span> (通常以 .jpg 或 .png 结尾)<br/>
                     4. 粘贴到左侧输入框并保存
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;