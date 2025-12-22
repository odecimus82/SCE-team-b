
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('offline');

  const refreshData = async () => {
    setIsRefreshing(true);
    const data = await storageService.fetchRemoteRegistrations();
    setRegistrations(data);
    
    // 简单检测同步状态
    try {
      const res = await fetch('/api/sync');
      setDbStatus(res.ok ? 'connected' : 'offline');
    } catch {
      setDbStatus('offline');
    }
    
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const timer = setInterval(refreshData, 15000);
      return () => clearInterval(timer);
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

  const exportToExcel = () => {
    if (registrations.length === 0) return alert("暂无数据");
    const headers = ["姓名", "英文名", "电话", "随行成人", "随行儿童", "报名时间"];
    const rows = registrations.map(reg => [
      reg.name, reg.englishName || '-', `'${reg.phone}`, reg.adultFamilyCount, reg.childFamilyCount, new Date(reg.timestamp).toLocaleString()
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CORSAIR_报名表_${new Date().toLocaleDateString()}.csv`;
    link.click();
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
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto rotate-3 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase">管理入口</h2>
            <p className="text-gray-400 text-xs font-bold mt-1 tracking-widest">RESTRICTED AREA</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              autoFocus
              placeholder="管理员密码" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none transition-all font-bold text-center"
            />
            <button className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">进入后台</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-gray-900 uppercase">数据看板</h2>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${dbStatus === 'connected' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
            {dbStatus === 'connected' ? '云端已同步' : '本地模式'}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-xs hover:bg-green-700 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            导出表格
          </button>
          <button onClick={refreshData} className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl font-black text-xs hover:bg-gray-200 transition-all">刷新数据</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '总人数', value: stats.totalPeople, sub: '预计到场', color: 'text-gray-900' },
          { label: '员工数', value: stats.employees, sub: '已报人数', color: 'text-sky-500' },
          { label: '大人家属', value: stats.familyAdults, sub: '随行亲友', color: 'text-blue-500' },
          { label: '随行儿童', value: stats.children, sub: '12岁以下', color: 'text-green-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-3xl font-black my-1 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 font-bold">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest">分布详情</h3>
          <div className="h-[250px] w-full">
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

        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest">最新动态</h3>
          <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
            {registrations.slice().reverse().map((reg, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-sky-200 transition-all group">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-black text-gray-900 text-sm">{reg.name} <span className="text-[10px] text-gray-400 font-normal">({reg.englishName || 'N/A'})</span></p>
                    <p className="text-[10px] text-sky-600 font-bold mt-0.5">{reg.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900">+{reg.adultFamilyCount + reg.childFamilyCount}</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">{new Date(reg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              </div>
            ))}
            {registrations.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-300 font-bold text-xs">暂无报名数据</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
