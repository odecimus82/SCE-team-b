
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { MAX_CAPACITY, REGISTRATION_DEADLINE } from '../constants';

interface Props {
  onSuccess: () => void;
}

const RegistrationForm: React.FC<Props> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    department: '',
    adultFamilyCount: 0,
    childFamilyCount: 0,
    dietaryNotes: '',
  });
  const [currentCount, setCurrentCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setCurrentCount(storageService.getTotalCount());
  }, []);

  const neededSlots = 1 + formData.adultFamilyCount + formData.childFamilyCount;
  const remainingSlots = MAX_CAPACITY - currentCount;
  const isOverflow = neededSlots > remainingSlots;
  const isDeadlinePassed = Date.now() > REGISTRATION_DEADLINE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeadlinePassed) {
      alert("抱歉，报名时间已截止。");
      return;
    }
    if (isOverflow) {
      alert(`抱歉，名额不足。当前仅剩 ${remainingSlots} 个名额。`);
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      storageService.saveRegistration(formData);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">SCE 报名成功！</h2>
        <p className="text-gray-600">您的信息已入库。2026年1月10日不见不散！</p>
      </div>
    );
  }

  if (isDeadlinePassed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="bg-red-50 border-4 border-red-500 p-12 rounded-[3rem] space-y-6">
          <h2 className="text-4xl font-black text-red-600">报名通道已关闭</h2>
          <p className="text-xl text-gray-600 font-bold">截止日期：2025年12月26日 18:00</p>
          <p className="text-gray-500 leading-relaxed">非常抱歉，我们已经停止接收新的报名。如有特殊需求，请直接联系 HR 部门。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-sky-500 p-10 text-white relative">
          <h2 className="text-4xl font-black">SCE 团队报名</h2>
          <p className="opacity-90 font-bold mt-2">松山湖之约 • 限额 21 人</p>
          <div className="absolute top-10 right-10 bg-black/20 px-4 py-1 rounded-full text-xs font-bold border border-white/30">
            剩余 {remainingSlots} 位
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-widest">姓名</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="您的真实姓名" className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-widest">工号</label>
              <input required type="text" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} placeholder="SCE-XXXX" className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 uppercase tracking-widest">部门</label>
            <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-sky-500 appearance-none bg-white">
              <option value="">点击选择部门</option>
              <option value="研发一部">研发一部</option>
              <option value="研发二部">研发二部</option>
              <option value="产品中心">产品中心</option>
              <option value="运营支撑">运营支撑</option>
              <option value="综合管理">综合管理</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-sky-50 rounded-3xl border-2 border-sky-100">
            <div className="space-y-2">
              <label className="text-sm font-black text-sky-900">随行大人 (费用自理)</label>
              <input type="number" min="0" max="5" value={formData.adultFamilyCount} onChange={e => setFormData({...formData, adultFamilyCount: parseInt(e.target.value) || 0})} className="w-full px-6 py-4 rounded-2xl border-2 border-white bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-sky-900">随行儿童 (SCE 赞助)</label>
              <input type="number" min="0" max="5" value={formData.childFamilyCount} onChange={e => setFormData({...formData, childFamilyCount: parseInt(e.target.value) || 0})} className="w-full px-6 py-4 rounded-2xl border-2 border-white bg-white" />
            </div>
          </div>

          <div className={`p-6 rounded-2xl text-center font-bold ${isOverflow ? 'bg-red-50 text-red-600 animate-bounce' : 'bg-gray-50 text-gray-500'}`}>
            本次共占用 {neededSlots} 个名额
            {isOverflow && " (已超出剩余名额)"}
          </div>

          <button 
            disabled={isSubmitting || isOverflow || remainingSlots <= 0 || isDeadlinePassed}
            type="submit"
            className={`w-full font-black py-6 rounded-[2rem] transition-all flex items-center justify-center gap-3 text-xl shadow-lg ${
              isOverflow || remainingSlots <= 0 || isDeadlinePassed
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-900 text-white hover:bg-black'
            }`}
          >
            {isSubmitting ? '正在入库...' : '确认预约席位'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
