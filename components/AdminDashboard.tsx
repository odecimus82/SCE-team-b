
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration, CampusInfoSection, AppConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type AdminTab = 'stats' | 'list' | 'guide' | 'settings';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [campusData, setCampusData] = useState<CampusInfoSection[]>([]);
  const [config, setConfig] = useState<AppConfig>({ isRegistrationOpen: true, deadline: Date.now() });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('offline');

  const refreshData = async () => {
    const regs = await storageService.fetchRemoteRegistrations();
    setRegistrations([...regs].sort((a, b) => b.timestamp - a.timestamp));
    const guide = await storageService.fetchCampusData();
    setCampusData(guide);
    const appConfig = await storageService.fetchConfig();
    setConfig(appConfig);
    
    try {
      const res = await fetch('/api/sync');
      setDbStatus(res.ok ? 'connected' : 'offline');
    } catch {
      setDbStatus('offline');
    }
  };

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'sce2026') setIsAuthenticated(true);
    else alert('密码错误！');
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    const success = await storageService.saveConfig(config);
    if (success) alert('设置已同步！');
    else alert('保存失败');
    setIsSaving(false);
  };

  const handleSaveGuide = async () => {
    setIsSaving(true);
    const success = await storageService.saveCampusDataToCloud(campusData);
    if (success) alert('指南已同步！');
    else alert('保存失败');
    setIsSaving(false);
  };

  const exportToExcel = () => {
    if (registrations.length === 0) return alert('暂无数据');
    const headers = ['报名ID', '姓名', '英文名', '手机', '大人', '儿童', '总计', '时间', '修改过'];
    const rows = registrations.map(reg => [
      reg.id, reg.name, reg.englishName, reg.phone, reg.adultFamilyCount, reg.childFamilyCount,
      1 + reg.adultFamilyCount + reg.childFamilyCount, new Date(reg.timestamp).toLocaleString(), reg.hasEdited ? '是' : '否'
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Corsair_名单_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const stats = registrations.reduce((acc, reg) => {
    acc.totalPeople += 1 + (Number(reg.adultFamilyCount) || 0) + (Number(reg.childFamilyCount) || 0);
    acc.employees += 1;
    acc.familyAdults += (Number(reg.adultFamilyCount) || 0);
    acc.children += (Number(reg.childFamilyCount) || 0);
    return acc;
  }, { totalPeople: 0, employees: 0, familyAdults: 0, children: 0 });

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
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-2xl">
          {(['stats', 'list', 'guide', 'settings'] as AdminTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl font-black text-[10px] sm:text-xs transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab === 'stats' ? '概览' : tab === 'list' ? '名单' : tab === 'guide' ? '指南' : '设置'}
            </button>
          ))}
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${dbStatus === 'connected' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
          <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
          {dbStatus === 'connected' ? '云端在线' : '离线模式'}
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '预计到场', value: stats.totalPeople, sub: '总人数' },
            { label: '员工数', value: stats.employees, sub: '报名人' },
            { label: '大人家属', value: stats.familyAdults, sub: '随行' },
            { label: '随行儿童', value: stats.children, sub: '12岁以下' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black my-1 text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400 font-bold">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-900 uppercase">报名名单 (共{registrations.length}条)</h3>
            <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-md">导出 EXCEL</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
                  <th className="px-4 py-3">姓名</th>
                  <th className="px-4 py-3">手机</th>
                  <th className="px-4 py-3 text-center">大人</th>
                  <th className="px-4 py-3 text-center">儿童</th>
                  <th className="px-4 py-3">时间</th>
                  <th className="px-4 py-3 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.map(reg => (
                  <tr key={reg.id} className="text-xs">
                    <td className="px-4 py-3 font-black">{reg.name} <span className="text-gray-400 ml-1">{reg.englishName}</span></td>
                    <td className="px-4 py-3 font-mono">{reg.phone}</td>
                    <td className="px-4 py-3 text-center">{reg.adultFamilyCount}</td>
                    <td className="px-4 py-3 text-center">{reg.childFamilyCount}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(reg.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${reg.hasEdited ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{reg.hasEdited ? '已改' : '正常'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">系统权限控制</h3>
              <p className="text-xs text-gray-500 font-medium">设置报名的全局状态与截止时间。</p>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-black text-sm text-gray-900">开放报名/修改</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Master Registration Switch</p>
              </div>
              <button 
                onClick={() => setConfig({...config, isRegistrationOpen: !config.isRegistrationOpen})}
                className={`w-14 h-8 rounded-full transition-all relative ${config.isRegistrationOpen ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${config.isRegistrationOpen ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">修改截止时间</label>
              <input 
                type="datetime-local" 
                value={new Date(config.deadline).toISOString().slice(0, 16)} 
                onChange={e => setConfig({...config, deadline: new Date(e.target.value).getTime()})}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-gray-900"
              />
              <p className="text-[10px] text-amber-600 font-bold">* 到达此时间后，前端将自动关闭“立即预约”和“修改报名”入口。</p>
            </div>

            <button 
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full bg-sky-500 text-white font-black py-4 rounded-2xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-100"
            >
              {isSaving ? '正在保存...' : '确认并同步到云端'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center py-20">
          <p className="text-gray-400 font-bold">指南编辑模块（原有逻辑）</p>
          <button onClick={handleSaveGuide} className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-xl text-xs font-black">保存指南</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
