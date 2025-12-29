
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration, CampusInfoSection, AppConfig, EditLog } from '../types';

type AdminTab = 'stats' | 'list' | 'logs' | 'settings' | 'guide';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [campusData, setCampusData] = useState<CampusInfoSection[]>([]);
  const [logs, setLogs] = useState<EditLog[]>([]);
  const [config, setConfig] = useState<AppConfig>({ isRegistrationOpen: true, deadline: Date.now(), maxCapacity: 21 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('offline');

  const refreshData = async () => {
    const [regs, guide, appConfig, editLogs] = await Promise.all([
      storageService.fetchRemoteRegistrations(),
      storageService.fetchCampusData(),
      storageService.fetchConfig(),
      storageService.fetchLogs()
    ]);

    setRegistrations([...regs].sort((a, b) => b.timestamp - a.timestamp));
    setCampusData(guide);
    setConfig(appConfig);
    setLogs(editLogs);
    
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
      const timer = setInterval(refreshData, 30000); // 30秒自动刷新一次
      return () => clearInterval(timer);
    }
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
          {[
            { id: 'stats', label: '概览' },
            { id: 'list', label: '名单' },
            { id: 'logs', label: '修改提醒' },
            { id: 'settings', label: '设置' },
            { id: 'guide', label: '指南' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`px-4 py-2 rounded-xl font-black text-[10px] sm:text-xs transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab.label}
              {tab.id === 'logs' && logs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full">{logs.length}</span>
              )}
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
            { label: '预计到场', value: stats.totalPeople, sub: `目标上限: ${config.maxCapacity}` },
            { label: '员工数', value: stats.employees, sub: '有效报名' },
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
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
                  <th className="px-4 py-3">姓名</th>
                  <th className="px-4 py-3">手机</th>
                  <th className="px-4 py-3 text-center">人数</th>
                  <th className="px-4 py-3">最后更新</th>
                  <th className="px-4 py-3 text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.map(reg => (
                  <tr key={reg.id} className="text-xs">
                    <td className="px-4 py-3 font-black">{reg.name} <span className="text-gray-400 ml-1">{reg.englishName}</span></td>
                    <td className="px-4 py-3 font-mono">{reg.phone}</td>
                    <td className="px-4 py-3 text-center">{1 + reg.adultFamilyCount + reg.childFamilyCount}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(reg.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${reg.hasEdited ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{reg.hasEdited ? '已修改' : '初始'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-sm font-black text-gray-900 uppercase">修改历史提醒 (近500条记录)</h3>
            <button onClick={refreshData} className="text-sky-500 font-bold text-xs hover:underline">刷新列表</button>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold">暂无修改记录</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${log.action === 'create' ? 'bg-green-500' : 'bg-amber-500'}`}>
                      {log.action === 'create' ? '入' : '改'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {log.userName} <span className="text-gray-400 font-normal">{log.action === 'create' ? '完成了首次报名' : '修改了报名信息'}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${log.action === 'create' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                    {log.action === 'create' ? 'NEW ENTRY' : 'MODIFIED'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">系统权限控制</h3>
              <p className="text-xs text-gray-500 font-medium">设置报名的全局状态、截止时间及人数上限。</p>
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">修改截止时间</label>
                <input 
                  type="datetime-local" 
                  value={new Date(config.deadline).toISOString().slice(0, 16)} 
                  onChange={e => setConfig({...config, deadline: new Date(e.target.value).getTime()})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-gray-900"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">报名人数上限</label>
                <input 
                  type="number" 
                  min="1"
                  value={config.maxCapacity} 
                  onChange={e => setConfig({...config, maxCapacity: parseInt(e.target.value) || 21})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black text-gray-900"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full bg-sky-500 text-white font-black py-4 rounded-2xl hover:bg-sky-600 transition-all shadow-lg"
            >
              {isSaving ? '正在保存...' : '保存设置'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center py-20">
          <p className="text-gray-400 font-bold italic">指南内容实时同步中</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
