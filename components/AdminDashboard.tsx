
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setRegistrations(storageService.getRegistrations());
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
      alert("当前没有报名数据可导出");
      return;
    }

    // 构造 CSV 内容
    const headers = ["姓名", "工号", "部门", "随行成人", "随行儿童", "备注", "报名时间"];
    const rows = registrations.map(reg => [
      reg.name,
      reg.employeeId,
      reg.department,
      reg.adultFamilyCount,
      reg.childFamilyCount,
      `"${reg.dietaryNotes.replace(/"/g, '""')}"`, // 转义引号
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
    { name: '员工', value: stats.employees },
    { name: '随行大人', value: stats.familyAdults },
    { name: '儿童', value: stats.children },
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
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900">SCE 报名数据看板</h2>
          <p className="text-gray-500">当前设备共存储 {registrations.length} 组报名信息。</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={exportToExcel}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出 Excel (CSV)
          </button>
          <button 
            onClick={() => { if(confirm('确认清除所有数据？此操作不可撤销。')) { storageService.clearAll(); setRegistrations([]); } }}
            className="bg-white text-red-500 border-2 border-red-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            清空数据库
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '预计总人数', value: stats.totalPeople, color: 'text-gray-900' },
          { label: '员工总数', value: stats.employees, color: 'text-sky-500' },
          { label: '家属(大人)', value: stats.familyAdults, color: 'text-blue-500' },
          { label: '家属(儿童)', value: stats.children, color: 'text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">人员构成比例</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : index === 1 ? '#3b82f6' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6">最新报名动态</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {registrations.length === 0 ? (
              <p className="text-gray-400 italic">暂无报名记录。</p>
            ) : (
              registrations.slice().reverse().map((reg, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-1 border border-transparent hover:border-sky-100 transition-all">
                  <div className="flex justify-between">
                    <p className="font-bold text-gray-900">{reg.name}</p>
                    <p className="text-xs text-gray-400">{new Date(reg.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-xs text-gray-500">{reg.department} • {reg.employeeId}</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">大人: {reg.adultFamilyCount}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">小孩: {reg.childFamilyCount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4">姓名</th>
              <th className="px-6 py-4">工号 / 部门</th>
              <th className="px-6 py-4">携带家属</th>
              <th className="px-6 py-4">特殊备注</th>
              <th className="px-6 py-4">报名日期</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                  还没有人报名，快去分享报名链接吧！
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{reg.name}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{reg.employeeId}</p>
                    <p className="text-xs text-gray-500">{reg.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">成人: {reg.adultFamilyCount}</span>
                      <span className="text-sm font-medium text-sky-500">儿童: {reg.childFamilyCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{reg.dietaryNotes || '-'}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{new Date(reg.timestamp).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-sky-50 p-6 rounded-2xl border-2 border-sky-100 flex items-center gap-4">
        <div className="p-2 bg-sky-500 text-white rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-sky-900 leading-relaxed font-medium">
          <strong>数据存储说明：</strong> 当前系统使用本地浏览器存储。如果需要汇总不同人填写的表格，请让所有人在各自电脑报名后，由管理员通过“导出 Excel”收集文件并进行合并。建议指定一名负责人进行最终名单核对。
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
