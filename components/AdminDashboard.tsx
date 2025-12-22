
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration, CampusInfoSection } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [campusSections, setCampusSections] = useState<CampusInfoSection[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'campus'>('stats');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    const data = await storageService.fetchRemoteRegistrations();
    setRegistrations(data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      // 每 10 秒自动刷新一次数据，实现实时汇总
      const timer = setInterval(refreshData, 10000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setCampusSections(storageService.getCampusData());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'sce2026') {
      setIsAuthenticated(true);
    } else {
      alert('密码错误！');
    }
  };

  const exportToExcel = () => {
    if (registrations.length === 0) {
      alert("当前没有数据");
      return;
    }
    const headers = ["姓名", "英文名", "联系方式", "随行成人", "随行儿童", "报名时间"];
    const rows = registrations.map(reg => [
      reg.name,
      reg.englishName || '-',
      `'${reg.phone}`,
      reg.adultFamilyCount,
      reg.childFamilyCount,
      new Date(reg.timestamp).toLocaleString()
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SCE_报名汇总_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const stats = registrations.reduce((acc, reg) => {
    acc.totalPeople += 1 + (reg.adultFamilyCount || 0) + (reg.childFamilyCount || 0);
    acc.employees += 1;
    acc.familyAdults += (reg.adultFamilyCount || 0);
    acc.children += (reg.childFamilyCount || 0);
    return acc;
  }, { totalPeople: 0, employees: 0, familyAdults: 0, children: 0 });

  const chartData = [
    { name: '参与者', value: stats.employees },
    { name: '随行大人', value: stats.familyAdults },
    { name: '随行儿童', value: stats.children },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">管理员登录</h2>
            <p className="text-sm text-gray-500">查看实时汇总的报名信息</p>
          </div>
          <input 
            type="password"
            placeholder="请输入管理员密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-sky-400/20 outline-none"
          />
          <button className="w-full bg-gray-900 text-sky-400 font-bold py-3 rounded-xl hover:bg-black">登录</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl relative">
          <button onClick={() => setActiveTab('stats')} className={`px-8 py-3 rounded-xl font-black transition-all ${activeTab === 'stats' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400'}`}>数据看板</button>
          <button onClick={() => setActiveTab('campus')} className={`px-8 py-3 rounded-xl font-black transition-all ${activeTab === 'campus' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400'}`}>指南管理</button>
          {isRefreshing && <div className="absolute -top-2 -right-2 w-3 h-3 bg-sky-500 rounded-full animate-ping"></div>}
        </div>
        <div className="flex gap-4">
          <button onClick={exportToExcel} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-700">导出名单</button>
          <button onClick={refreshData} className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 flex items-center gap-2">
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            刷新
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '预计总人数', value: stats.totalPeople, color: 'text-gray-900' },
          { label: '已报名员工', value: stats.employees, color: 'text-sky-500' },
          { label: '随行大人', value: stats.familyAdults, color: 'text-blue-500' },
          { label: '随行儿童', value: stats.children, color: 'text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-8 uppercase">人员比例</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : index === 1 ? '#3b82f6' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-8 uppercase">实时列表</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {registrations.slice().reverse().map((reg, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl border border-transparent hover:border-sky-100 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-gray-900 text-sm">{reg.name} <span className="text-gray-400 text-xs font-normal">({reg.englishName})</span></p>
                    <p className="text-[10px] text-sky-600 font-bold">{reg.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold">随行: {reg.adultFamilyCount + reg.childFamilyCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
