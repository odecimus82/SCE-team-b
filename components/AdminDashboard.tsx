
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { Registration, CampusInfoSection } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [campusSections, setCampusSections] = useState<CampusInfoSection[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'campus'>('stats');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setRegistrations(storageService.getRegistrations());
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

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 使用 Canvas 压缩图片，防止 Base64 溢出 localStorage 限制
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        const updated = [...campusSections];
        updated[index].image = compressedBase64;
        setCampusSections(updated);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveCampusConfig = () => {
    storageService.saveCampusData(campusSections);
    setSaveStatus('园区内容已同步更新！');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const exportToExcel = () => {
    if (registrations.length === 0) {
      alert("当前没有报名数据可导出");
      return;
    }
    const headers = ["姓名", "联系方式", "随行成人", "随行儿童", "报名时间"];
    const rows = registrations.map(reg => [
      reg.name,
      `'${reg.phone}`,
      reg.adultFamilyCount,
      reg.childFamilyCount,
      new Date(reg.timestamp).toLocaleString()
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `SCE_Team_2026_报名汇总_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = registrations.reduce((acc, reg) => {
    acc.totalPeople += 1 + reg.adultFamilyCount + reg.childFamilyCount;
    acc.employees += 1;
    acc.familyAdults += reg.adultFamilyCount;
    acc.children += reg.childFamilyCount;
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
            <h2 className="text-2xl font-bold text-gray-900">后台管理员登录</h2>
            <p className="text-sm text-gray-500">此区域仅限 SCE Team 活动负责人访问。</p>
          </div>
          <input 
            type="password"
            placeholder="请输入管理员密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-sky-400/20 outline-none"
          />
          <button className="w-full bg-gray-900 text-sky-400 font-bold py-3 rounded-xl hover:bg-black transition-all">
            解锁面板
          </button>
          <p className="text-[10px] text-center text-gray-400 italic">提示：sce2026</p>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-8 py-3 rounded-xl font-black transition-all ${activeTab === 'stats' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            数据看板
          </button>
          <button 
            onClick={() => setActiveTab('campus')}
            className={`px-8 py-3 rounded-xl font-black transition-all ${activeTab === 'campus' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            园区指南管理
          </button>
        </div>
        <div className="flex gap-4">
          <button onClick={exportToExcel} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center gap-2">
            导出名单
          </button>
          <button onClick={() => { if(confirm('清除所有数据？')) { storageService.clearAll(); window.location.reload(); } }} className="text-red-500 font-bold text-sm hover:underline">
            清空所有
          </button>
        </div>
      </div>

      {activeTab === 'stats' ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: '预计总人数', value: stats.totalPeople, color: 'text-gray-900' },
              { label: '已报名成员', value: stats.employees, color: 'text-sky-500' },
              { label: '随行大人', value: stats.familyAdults, color: 'text-blue-500' },
              { label: '随行儿童', value: stats.children, color: 'text-green-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">人员比例</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold'}} />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={80}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : index === 1 ? '#3b82f6' : '#22c55e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">最近报名</h3>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {registrations.slice().reverse().map((reg, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-sky-100 transition-all">
                    <p className="font-black text-gray-900">{reg.name}</p>
                    <p className="text-xs text-sky-600 font-bold">{reg.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">园区指南内容管理</h3>
                <p className="text-gray-500 font-medium">在此上传的图片将实时更新到“园区指南”页面，所有人均可见。</p>
              </div>
              <button 
                onClick={saveCampusConfig}
                className="bg-sky-500 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all active:scale-95"
              >
                保存所有更改
              </button>
            </div>

            {saveStatus && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold flex items-center gap-3 animate-bounce">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {saveStatus}
              </div>
            )}

            <div className="grid grid-cols-1 gap-12">
              {campusSections.map((section, idx) => (
                <div key={idx} className="grid lg:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">板块标题</label>
                    <input 
                      type="text" 
                      value={section.title} 
                      onChange={e => {
                        const updated = [...campusSections];
                        updated[idx].title = e.target.value;
                        setCampusSections(updated);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none font-bold"
                    />
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mt-4">描述文字</label>
                    <textarea 
                      rows={4}
                      value={section.description} 
                      onChange={e => {
                        const updated = [...campusSections];
                        updated[idx].description = e.target.value;
                        setCampusSections(updated);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none font-medium text-sm leading-relaxed"
                    />
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">板块实景图预览</label>
                    <div className="relative group rounded-2xl overflow-hidden aspect-video border-4 border-white shadow-sm bg-gray-200">
                      <img src={section.image} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-gray-900 px-6 py-3 rounded-xl font-black shadow-xl hover:scale-105 transition-transform">
                          点击更换图片
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(idx, e)} 
                          />
                        </label>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium italic">建议上传 16:9 比例的图片，系统会自动进行高清压缩处理以优化加载速度。</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
