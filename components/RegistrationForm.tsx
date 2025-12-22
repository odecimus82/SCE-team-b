
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
        const success = storageService.updateRegistration(ownRegId, formData);
        if (!success) {
          alert("修改失败，可能您已经修改过一次或信息不存在。");
          onSuccess();
          return;
        }
      } else {
        storageService.saveRegistration(formData);
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
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 p-6 sm:p-10 text-white relative text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-sky-500 rounded-full blur-3xl opacity-30"></div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">
            {editMode ? '修改我的报名' : 'CORSAIR (SCE) 团队报名'}
          </h2>
          <p className="opacity-70 font-bold mt-1 sm:mt-2 text-sm sm:text-lg uppercase tracking-widest text-sky-400">
            松山湖之约 • 限额 21 人
          </p>
          <div className="inline-block mt-4 bg-white/10 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black border border-white/20 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
            当前剩余 {remainingSlots} 个名额
          </div>
          {editMode && (
            <div className="mt-4 block sm:inline-block text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-4 py-1 rounded-full border border-amber-400/20">
              提示：仅限修改 1 次
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8 sm:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-widest block ml-1">您的姓名</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="真实姓名" 
                className="w-full px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none transition-all placeholder:text-gray-300 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] sm:text-sm font-black text-gray-700 uppercase tracking-widest block ml-1">联系电话</label>
              <input 
                required 
                type="tel" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="手机号码" 
                className="w-full px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-100 focus:border-sky-500 outline-none transition-all placeholder:text-gray-300 font-bold" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-10 bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-slate-100 relative overflow-hidden group">
            <div className="space-y-2 relative z-10">
              <label className="text-[10px] sm:text-sm font-black text-gray-600 uppercase tracking-widest block ml-1">随行大人 (自理)</label>
              <input 
                type="number" 
                min="0" 
                max="5" 
                value={formData.adultFamilyCount} 
                onChange={e => setFormData({...formData, adultFamilyCount: parseInt(e.target.value) || 0})} 
                className="w-full px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-white bg-white focus:border-sky-400 outline-none shadow-sm font-black text-center text-lg" 
              />
            </div>
            <div className="space-y-2 relative z-10">
              <label className="text-[10px] sm:text-sm font-black text-gray-600 uppercase tracking-widest block ml-1">随行儿童 (支持)</label>
              <input 
                type="number" 
                min="0" 
                max="5" 
                value={formData.childFamilyCount} 
                onChange={e => setFormData({...formData, childFamilyCount: parseInt(e.target.value) || 0})} 
                className="w-full px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-white bg-white focus:border-sky-400 outline-none shadow-sm font-black text-center text-lg" 
              />
            </div>
          </div>

          <div className={`p-6 sm:p-8 rounded-[1rem] sm:rounded-[1.5rem] text-center font-black text-base sm:text-lg transition-all border-2 ${neededSlots === 0 ? 'bg-gray-50 border-gray-100 text-gray-400' : isOverflow ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-sky-500 text-white border-sky-600 shadow-xl shadow-sky-200'}`}>
            {neededSlots === 0 ? "请完善上方报名信息" : `合计占用 ${neededSlots} 个席位`}
            {isOverflow && " (名额溢出)"}
          </div>

          <div className="space-y-4">
            <button 
              disabled={isSubmitting || isOverflow || remainingSlots <= 0 || isDeadlinePassed || !hasStartedFilling}
              type="submit"
              className={`w-full font-black py-4 sm:py-6 rounded-xl sm:rounded-[2rem] transition-all flex items-center justify-center gap-3 text-lg sm:text-2xl shadow-xl active:scale-[0.98] uppercase tracking-tighter ${
                isOverflow || remainingSlots <= 0 || isDeadlinePassed || !hasStartedFilling
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : editMode ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200' : 'bg-gray-900 text-white hover:bg-black hover:shadow-2xl shadow-gray-200'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  同步中...
                </span>
              ) : editMode ? '确认修改 (仅限1次)' : '锁定团建名额'}
            </button>
            
            <button 
              type="button"
              onClick={onSuccess}
              className="w-full text-center text-gray-400 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:text-gray-600 transition-colors py-2"
            >
              取消返回
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
