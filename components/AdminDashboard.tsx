
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

  // 新增/编辑相关的状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [modalData, setModalData] = useState<Partial<Registration>>({
    name: '', englishName: '', phone: '', adultFamilyCount: 0, childFamilyCount: 0
  });

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
      const timer = setInterval(refreshData, 30000); 
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'sce2026') setIsAuthenticated(true);
    else alert('密码错误！');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定要删除 ${name} 的报名记录吗？该操作不可撤销。`)) return;
    const success = await storageService.adminDeleteRegistration(id, name);
    if (success) {
      alert('已删除');
      refreshData();
    }
  };

  const handleOpenModal = (reg?: Registration) => {
    if (reg) {
      setEditingReg(reg);
      setModalData(reg);
    } else {
      setEditingReg(null);
      setModalData({ name: '', englishName: '', phone: '', adultFamilyCount: 0, childFamilyCount: 0 });
    }
    setShowAddModal(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: Registration = {
      id: editingReg?.id || Math.random().toString(36).substr(2, 9),
      name: modalData.name || '',
      englishName: modalData.englishName || '',
      phone: modalData.phone || '',
      adultFamilyCount: Number(modalData.adultFamilyCount) || 0,
      childFamilyCount: Number(modalData.childFamilyCount) || 0,
      timestamp: Date.now(),
      hasEdited: !!editingReg
    };

    const success = await storageService.adminSaveRegistration(finalData);
    if (success) {
      setShowAddModal(false);
      refreshData();
    } else {
      alert('保存失败');
    }
  };

  // Fix: Added handleSaveConfig to persist application configuration changes.
  const handleSaveConfig = async () => {
    setIsSaving(true);
    const success = await storageService.saveConfig(config);
    setIsSaving(false);
    if (success) {
      alert('设置已成功同步至云端');
      refreshData();
    } else {
      alert('保存失败，请检查网络连接或权限');
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return alert('当前没有可导出的数据');
    
    const headers = ['报名ID', '姓名', '英文名', '手机号', '随行大人', '随行儿童', '总人数', '最后更新时间', '修改状态'];
    const rows = registrations.map(reg => [
      reg.id,
      reg.name,
      reg.englishName || '-',
      reg.phone,
      reg.adultFamilyCount,
      reg.childFamilyCount,
      1 + reg.adultFamilyCount + reg.childFamilyCount,
      new Date(reg.timestamp).toLocaleString(),
      reg.hasEdited ? '已修改' : '初始报名'
    ]);
    
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Corsair_2026_报名详情_${new Date().toLocaleDateString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
            { id: 'list', label: '详细名单' },
            { id: 'logs', label: '修改提醒' },
            { id: 'settings', label: '系统设置' },
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
          {dbStatus === 'connected' ? '云端同步中' : '离线模式'}
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '预计到场总计', value: stats.totalPeople, sub: `报名上限: ${config.maxCapacity}`, color: 'text-sky-500' },
            { label: 'Corsair 员工', value: stats.employees, sub: '主报名人', color: 'text-gray-900' },
            { label: '大人家属', value: stats.familyAdults, sub: '不含员工本人', color: 'text-gray-700' },
            { label: '随行儿童', value: stats.children, sub: '12岁以下', color: 'text-gray-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-3xl font-black my-1 ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-bold">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-900 uppercase">报名人员详细清单 (共{registrations.length}条记录)</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Full List of Registered Participants</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenModal()}
                className="bg-sky-500 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-sky-600 shadow-lg shadow-sky-100 transition-all flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                添加人员
              </button>
              <button 
                onClick={refreshData}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-gray-200 transition-colors"
              >
                刷新数据
              </button>
              <button 
                onClick={exportToCSV}
                className="bg-green-600 text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                导出 CSV 名单
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-50">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase">
                  <th className="px-4 py-3 border-b">姓名 / 英文名</th>
                  <th className="px-4 py-3 border-b">联系手机</th>
                  <th className="px-4 py-3 border-b text-center">大人</th>
                  <th className="px-4 py-3 border-b text-center">儿童</th>
                  <th className="px-4 py-3 border-b text-center">总计</th>
                  <th className="px-4 py-3 border-b">最后提交时间</th>
                  <th className="px-4 py-3 border-b text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-400 font-bold italic">暂无报名信息</td>
                  </tr>
                ) : (
                  registrations.map(reg => (
                    <tr key={reg.id} className="text-xs hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="font-black text-gray-900">{reg.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{reg.englishName}</div>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-sky-600">{reg.phone}</td>
                      <td className="px-4 py-4 text-center font-bold text-gray-700">{reg.adultFamilyCount}</td>
                      <td className="px-4 py-4 text-center font-bold text-gray-700">{reg.childFamilyCount}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-gray-900 text-white px-2 py-0.5 rounded text-[10px] font-black">
                          {1 + reg.adultFamilyCount + reg.childFamilyCount}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-400 font-medium">
                        {new Date(reg.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <button onClick={() => handleOpenModal(reg)} className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-all" title="编辑">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                           </button>
                           <button onClick={() => handleDelete(reg.id, reg.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="删除">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 手动新增/编辑弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
             <div className="bg-gray-900 p-6 text-white text-center">
                <h3 className="text-xl font-black uppercase tracking-tight">{editingReg ? '编辑报名信息' : '手动录入报名'}</h3>
             </div>
             <form onSubmit={handleModalSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">中文姓名</label>
                    <input required type="text" value={modalData.name} onChange={e => setModalData({...modalData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">英文名</label>
                    <input required type="text" value={modalData.englishName} onChange={e => setModalData({...modalData, englishName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">联系电话</label>
                  <input required type="tel" value={modalData.phone} onChange={e => setModalData({...modalData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="space-y-1 text-center">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">随行大人</label>
                    <input type="number" min="0" value={modalData.adultFamilyCount} onChange={e => setModalData({...modalData, adultFamilyCount: parseInt(e.target.value) || 0})} className="w-full px-2 py-2 text-center rounded-lg border-none font-black text-lg bg-white" />
                  </div>
                  <div className="space-y-1 text-center">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">随行儿童</label>
                    <input type="number" min="0" value={modalData.childFamilyCount} onChange={e => setModalData({...modalData, childFamilyCount: parseInt(e.target.value) || 0})} className="w-full px-2 py-2 text-center rounded-lg border-none font-black text-lg bg-white" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 rounded-xl font-black text-sm text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors uppercase">取消</button>
                  <button type="submit" className="flex-1 px-6 py-4 rounded-xl font-black text-sm text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100 uppercase">确认保存</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-900 uppercase">修改提醒日志 (含具体变动内容)</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Modification Details Feed</p>
            </div>
            <button onClick={refreshData} className="text-sky-500 font-black text-xs hover:bg-sky-50 px-3 py-1 rounded-lg transition-colors">强制刷新</button>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold">目前还没有任何修改记录</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex flex-col gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-sky-100 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm ${log.action === 'create' ? 'bg-green-500' : 'bg-amber-500'}`}>
                        {log.action === 'create' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          {log.userName} <span className="text-gray-400 font-medium">{log.action === 'create' ? '完成了报名' : '修改了信息'}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${log.action === 'create' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                      {log.action === 'create' ? 'SUCCESS' : 'UPDATED'}
                    </div>
                  </div>
                  {log.details && (
                    <div className="mt-1 pl-12">
                      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> 变更详情
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {log.details.split(' | ').map((d, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-50 text-gray-600 rounded-lg text-[10px] font-bold border border-slate-100">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">系统权限与规则设置</h3>
              <p className="text-xs text-gray-500 font-medium">配置全局开关、报名截止日期及人数上限阈值。</p>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-black text-sm text-gray-900">开放报名/修改入口</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Global Registration Status</p>
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">修改截止截止时间</label>
                <input 
                  type="datetime-local" 
                  value={new Date(config.deadline).toISOString().slice(0, 16)} 
                  onChange={e => setConfig({...config, deadline: new Date(e.target.value).getTime()})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-gray-900 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">预计报名人数上限</label>
                <input 
                  type="number" 
                  min="1"
                  value={config.maxCapacity} 
                  onChange={e => setConfig({...config, maxCapacity: parseInt(e.target.value) || 21})}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black text-gray-900 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black active:scale-95 transition-all shadow-lg shadow-gray-100"
            >
              {isSaving ? '正在同步云端设置...' : '保存系统设置'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center py-24 space-y-4">
          <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase">指南编辑系统</h3>
          <p className="text-gray-400 font-bold max-w-md mx-auto italic">指南模块已与云端存储挂钩，当前内容已由前端组件渲染，后端控制功能稍后逐步开放。</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
