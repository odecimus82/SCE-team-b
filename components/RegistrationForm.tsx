
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { MAX_CAPACITY, REGISTRATION_DEADLINE } from '../constants';

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
  const [currentCount, setCurrentCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ownRegId, setOwnRegId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentCount(storageService.getTotalCount());
    if (editMode) {
      const reg = storageService.getOwnRegistration();
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
          alert("您已经修改过一次报名信息，无法再次修改。");
          onSuccess();
        }
      } else {
        alert("未找到您的报名信息。");
        onSuccess();
      }
    }
  }, [editMode, onSuccess]);

  const hasStartedFilling = formData.name.trim() !== '' || 
                           formData.phone.trim() !== '' || 
                           formData.adultFamilyCount > 0 || 
                           formData.childFamilyCount > 0;
  
  const currentTotal = storageService.getTotalCount();
  const ownReg = storageService.getOwnRegistration();
  const ownBaseSlots = ownReg ? (1 + ownReg.adultFamilyCount + ownReg.childFamilyCount) : 0;
  
  const neededSlots = hasStartedFilling ? 1 + formData.adultFamilyCount + formData.childFamilyCount : 0;
  const remainingSlots = editMode 
    ? MAX_CAPACITY - (currentTotal - ownBaseSlots) 
    : MAX_CAPACITY - currentCount;

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
      if (editMode && ownRegId) {
        const success = storageService.updateRegistration(ownRegId, formData as any);
        if (!success) {
          alert("修改失败，可能您已经修改过一次或信息不存在。");
          onSuccess();
          return;
        }
      } else {
        storageService.saveRegistration(formData as any);
      }
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="max-w-lg mx-auto py-16 sm:py-24 text-center space-y-6 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
            {editMode ? '信息更新成功' : 'CORSAIR (SCE) 报名成功'}
          </h2>
          <p className="text-gray-500 font-medium px-4">
            您的信息已同步至系统。2026年1月10日不见不散！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 p-6 sm:p-8 text-white relative text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
            {editMode ? '修改我的报名' : '活动报名'}
          </h2>
          <p className="opacity-70 font-bold mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-sky-400">
            松山湖之约 • 限额 21 人 (剩 {remainingSlots} 位)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">中文姓名</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="真实姓名" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none transition-all placeholder:text-gray-300 font-bold text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">英文名 / Alias</label>
              <input 
                required 
                type="text" 
                value={formData.englishName} 
                onChange={e => setFormData({...formData, englishName: e.target.value})} 
                placeholder="English Name" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none transition-all placeholder:text-gray-300 font-bold text-sm" 
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">联系电话</label>
              <input 
                required 
                type="tel" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="手机号码" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none transition-all placeholder:text-gray-300 font-bold text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block ml-1 text-center">随行大人 (自理)</label>
              <input 
                type="number" 
                min="0" 
                max="5" 
                value={formData.adultFamilyCount} 
                onChange={e => setFormData({...formData, adultFamilyCount: parseInt(e.target.value) || 0})} 
                className="w-full px-4 py-2.5 rounded-xl border border-white bg-white focus:border-sky-400 outline-none shadow-sm font-black text-center text-base" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block ml-1 text-center">随行儿童 (支持)</label>
              <input 
                type="number" 
                min="0" 
                max="5" 
                value={formData.childFamilyCount} 
                onChange={e => setFormData({...formData, childFamilyCount: parseInt(e.target.value) || 0})} 
                className="w-full px-4 py-2.5 rounded-xl border border-white bg-white focus:border-sky-400 outline-none shadow-sm font-black text-center text-base" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <button 
              disabled={isSubmitting || isOverflow || remainingSlots <= 0 || isDeadlinePassed || !hasStartedFilling}
              type="submit"
              className={`w-full font-black py-4 rounded-xl transition-all flex flex-col items-center justify-center gap-1 text-base sm:text-lg shadow-lg active:scale-[0.98] uppercase tracking-tight ${
                isOverflow || remainingSlots <= 0 || isDeadlinePassed || !hasStartedFilling
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : editMode ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-sky-500 text-white hover:bg-sky-600'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在同步...
                </span>
              ) : (
                <>
                  <span>{editMode ? '确认修改' : isOverflow ? '名额不足' : '锁定席位'}</span>
                  {neededSlots > 0 && !isOverflow && (
                    <span className="text-[10px] opacity-80 tracking-widest">合计占用 {neededSlots} 个名额</span>
                  )}
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={onSuccess}
              className="w-full text-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-colors py-2"
            >
              取消并返回
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
