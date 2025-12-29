
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Registration, AppConfig } from '../types';

interface Props {
  onSuccess: () => void;
  editMode?: boolean;
}

const RegistrationForm: React.FC<Props> = ({ onSuccess, editMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    englishName: '',
    phone: '',
    adultFamilyCount: 0,
    childFamilyCount: 0,
  });
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [config, setConfig] = useState<AppConfig>({ isRegistrationOpen: true, deadline: Date.now() + 86400000, maxCapacity: 28 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ownRegId, setOwnRegId] = useState<string | null>(null);
  const [matchedMsg, setMatchedMsg] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const appConfig = await storageService.fetchConfig();
      setConfig(appConfig);
      const regs = await storageService.fetchRemoteRegistrations();
      setAllRegistrations(regs);
      if (editMode) {
        const reg = await storageService.getOwnRegistration();
        if (reg) {
          setFormData({ name: reg.name, englishName: reg.englishName || '', phone: reg.phone, adultFamilyCount: reg.adultFamilyCount, childFamilyCount: reg.childFamilyCount });
          setOwnRegId(reg.id);
        }
      }
    };
    init();
  }, [editMode]);

  useEffect(() => {
    const trimmedName = formData.name.trim();
    if (!trimmedName || allRegistrations.length === 0) {
      setMatchedMsg('');
      return;
    }
    const match = allRegistrations.find(r => r.name.trim() === trimmedName);
    if (match) {
      setFormData(prev => ({ ...prev, englishName: match.englishName, phone: match.phone, adultFamilyCount: match.adultFamilyCount, childFamilyCount: match.childFamilyCount }));
      setOwnRegId(match.id);
      setMatchedMsg('✨ 系统已自动跳出您的历史报名信息，您可以直接修改并保存');
    } else {
      setMatchedMsg('');
    }
  }, [formData.name, allRegistrations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() > config.deadline) return alert("报名已截止。");
    setIsSubmitting(true);
    try {
      await storageService.saveRegistration(formData);
      setShowSuccess(true);
      setTimeout(onSuccess, 2000);
    } catch (e) {
      alert("提交失败，请检查网络");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 uppercase">信息已更新</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">{editMode || ownRegId ? '信息修改' : '实时报名'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">中文姓名</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm shadow-sm" />
              {matchedMsg && <p className="text-[9px] text-green-600 font-black italic mt-1">{matchedMsg}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">英文名</label>
              <input required type="text" value={formData.englishName} onChange={e => setFormData({...formData, englishName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm shadow-sm" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">联系电话</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1.5 text-center">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">随行大人</label>
              <input type="number" min="0" value={formData.adultFamilyCount} onChange={e => setFormData({...formData, adultFamilyCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 rounded-xl border-none shadow-sm font-black text-center text-base" />
            </div>
            <div className="space-y-1.5 text-center">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">随行儿童</label>
              <input type="number" min="0" value={formData.childFamilyCount} onChange={e => setFormData({...formData, childFamilyCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 rounded-xl border-none shadow-sm font-black text-center text-base" />
            </div>
          </div>

          {/* 团建特别须知 */}
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 space-y-3">
             <div className="flex items-center gap-2 text-red-600">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
               <span className="text-[10px] font-black uppercase tracking-widest">报名必读：团建守则</span>
             </div>
             <ul className="text-xs text-gray-600 space-y-2 font-medium">
               <li className="flex gap-2"><span>🛡️</span> <b>安全第一：</b>以家庭为单位，各自负责自家人员（特别是儿童）的游玩安全。</li>
               <li className="flex gap-2"><span>🍱</span> <b>餐饮自理：</b>园内可自行前往华为食堂、KFC或咖啡厅用餐，支持微信/支付宝。</li>
               <li className="flex gap-2"><span>🚫</span> <b>办公红线：</b>严禁进入办公区域，园区内请勿大声喧哗，文明参观。</li>
               <li className="flex gap-2"><span>📍</span> <b>闭环游玩：</b>请勿在中途走出园区，一旦走出将无法再次进入。</li>
             </ul>
          </div>

          <button disabled={isSubmitting} type="submit" className={`w-full font-black py-4 rounded-xl transition-all shadow-lg flex flex-col items-center justify-center gap-1 ${isSubmitting ? 'bg-gray-100 text-gray-400' : 'bg-sky-500 text-white hover:bg-sky-600 active:scale-95'}`}>
            {isSubmitting ? '处理中...' : (
              <>
                <span>我已阅读并确认报名</span>
                <span className="text-[10px] opacity-80 tracking-widest uppercase">SUBMIT TO JOIN</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
