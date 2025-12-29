
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
  const [config, setConfig] = useState<AppConfig | null>(null);
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
          setFormData({
            name: reg.name,
            englishName: reg.englishName || '',
            phone: reg.phone,
            adultFamilyCount: reg.adultFamilyCount,
            childFamilyCount: reg.childFamilyCount,
          });
          setOwnRegId(reg.id);
        }
      }
    };
    init();
  }, [editMode]);

  // 当姓名改变时尝试自动匹配
  useEffect(() => {
    const trimmedName = formData.name.trim();
    if (!trimmedName || allRegistrations.length === 0) {
      setMatchedMsg('');
      return;
    }

    // 只在中文姓名较完整（2个字以上）或完全匹配时触发提示，增强体验
    const match = allRegistrations.find(r => r.name.trim() === trimmedName);
    if (match) {
      // 如果数据还没被填充过，则自动跳出之前的信息进行修改
      // 检查当前其他字段是否大部分为空，或者姓名完全匹配时覆盖
      setFormData(prev => ({
        ...prev,
        englishName: match.englishName,
        phone: match.phone,
        adultFamilyCount: match.adultFamilyCount,
        childFamilyCount: match.childFamilyCount,
      }));
      setOwnRegId(match.id);
      setMatchedMsg('✨ 系统已自动跳出您的历史报名信息，您可以直接修改并保存');
    } else {
      setMatchedMsg('');
    }
  }, [formData.name, allRegistrations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    
    if (!config.isRegistrationOpen) return alert("管理员已暂时关闭报名入口。");
    if (Date.now() > config.deadline) return alert("报名已截止。");

    setIsSubmitting(true);
    try {
      // saveRegistration 内部会自动处理姓名冲突，匹配即更新
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
        <p className="text-gray-500 font-medium">数据已实时同步，修改记录已在后台登记。</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
            {editMode || ownRegId ? '信息修改' : '实时报名'}
          </h2>
          <p className="opacity-70 font-bold mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-sky-400">
            UNLIMITED MODIFICATION ENABLED
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 mb-2">
            <p className="text-[10px] text-sky-700 font-bold leading-relaxed">
              * 支持无限次修改：在下方输入【中文姓名】后，系统会自动调取您之前的记录。修改完毕后再次点击确认即可。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">中文姓名</label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="输入之前报名的姓名" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm focus:border-sky-500 transition-colors shadow-sm" 
              />
              {matchedMsg && <p className="text-[9px] text-green-600 font-black italic mt-1">{matchedMsg}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">英文名</label>
              <input required type="text" value={formData.englishName} onChange={e => setFormData({...formData, englishName: e.target.value})} placeholder="English Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm shadow-sm" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">联系电话</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="手机号码" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm shadow-sm" />
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

          <button 
            disabled={isSubmitting || !config}
            type="submit"
            className={`w-full font-black py-4 rounded-xl transition-all shadow-lg flex flex-col items-center justify-center gap-1 ${
              isSubmitting ? 'bg-gray-100 text-gray-400' : 'bg-sky-500 text-white hover:bg-sky-600 active:scale-95'
            }`}
          >
            {isSubmitting ? '处理中...' : (
              <>
                <span>{ownRegId ? '更新我的报名' : '确认报名'}</span>
                <span className="text-[10px] opacity-80 tracking-widest uppercase">SAVE TO CLOUD</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
