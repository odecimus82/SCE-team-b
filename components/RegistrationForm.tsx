import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { REGISTRATION_DEADLINE } from '../constants';

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
  const [currentTotal, setCurrentTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ownRegId, setOwnRegId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const remoteData = await storageService.fetchRemoteRegistrations();
      setCurrentTotal(storageService.calculateTotalCount(remoteData));

      if (editMode) {
        const reg = await storageService.getOwnRegistration();
        if (reg) {
          setFormData({
            name: reg.name,
            englishName: reg.englishName || '',
            phone: reg.phone,
            adultFamilyCount: reg.adultFamilyCount,
            childFamilyCount: reg.childFamilyCount,
          });
          setOwnRegId(reg.id);
          if (reg.hasEdited) {
            alert("您已经修改过一次报名信息。");
            onSuccess();
          }
        } else {
          onSuccess();
        }
      }
    };
    init();
  }, [editMode, onSuccess]);

  const neededSlots = 1 + (Number(formData.adultFamilyCount) || 0) + (Number(formData.childFamilyCount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() > REGISTRATION_DEADLINE) return alert("报名已截止");
    
    setIsSubmitting(true);
    try {
      if (editMode && ownRegId) {
        await storageService.updateRegistration(ownRegId, formData);
      } else {
        await storageService.saveRegistration(formData);
      }
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
        <h2 className="text-2xl font-black text-gray-900 uppercase">提交成功</h2>
        <p className="text-gray-500 font-medium">数据已实时同步至云端后台。</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
            {editMode ? '修改报名' : '实时报名系统'}
          </h2>
          <p className="opacity-70 font-bold mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-sky-400">
            云端实时同步 • 欢迎报名
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">中文姓名</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="真实姓名" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">英文名</label>
              <input required type="text" value={formData.englishName} onChange={e => setFormData({...formData, englishName: e.target.value})} placeholder="English Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">联系电话</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="手机号码" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block text-center">随行大人</label>
              <input type="number" min="0" value={formData.adultFamilyCount} onChange={e => setFormData({...formData, adultFamilyCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 rounded-xl border-none shadow-sm font-black text-center text-base" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block text-center">随行儿童</label>
              <input type="number" min="0" value={formData.childFamilyCount} onChange={e => setFormData({...formData, childFamilyCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 rounded-xl border-none shadow-sm font-black text-center text-base" />
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            type="submit"
            className={`w-full font-black py-4 rounded-xl transition-all shadow-lg flex flex-col items-center justify-center gap-1 ${
              isSubmitting ? 'bg-gray-100 text-gray-400' : 'bg-sky-500 text-white hover:bg-sky-600'
            }`}
          >
            {isSubmitting ? '同步中...' : (
              <>
                <span>确认提交</span>
                <span className="text-[10px] opacity-80 tracking-widest">本次共计 {neededSlots} 人</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;