
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
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ownRegId, setOwnRegId] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const init = async () => {
      const appConfig = await storageService.fetchConfig();
      setConfig(appConfig);

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
            alert("您已经修改过报名信息，无法再次修改。");
            onSuccess();
          }
        }
      }
    };
    init();
  }, [editMode, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    
    if (!config.isRegistrationOpen) return alert("管理员已暂时关闭报名入口。");
    if (Date.now() > config.deadline) return alert("报名已截止。");

    setIsSubmitting(true);
    try {
      if (editMode && ownRegId) {
        await storageService.updateRegistration(ownRegId, formData);
      } else {
        // 调用包含智能匹配逻辑的 saveRegistration
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
        <h2 className="text-2xl font-black text-gray-900 uppercase">数据已同步</h2>
        <p className="text-gray-500 font-medium">感谢您的配合，团建现场见！</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
            {editMode ? '信息修改' : '实时报名'}
          </h2>
          <p className="opacity-70 font-bold mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-sky-400">
            {editMode ? 'UPDATE YOUR DETAILS' : 'JOIN THE EXPEDITION'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {!editMode && (
            <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 mb-2">
              <p className="text-[10px] text-sky-700 font-bold leading-relaxed">
                * 提示：如果您在其他设备已报名，在此处输入【完全一致的姓名】提交，将自动覆盖并更新之前的记录。
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">中文姓名</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="输入真实姓名" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm" />
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
              isSubmitting ? 'bg-gray-100 text-gray-400' : 'bg-sky-500 text-white hover:bg-sky-600'
            }`}
          >
            {isSubmitting ? '处理中...' : (
              <>
                <span>{editMode ? '保存修改' : '确认报名'}</span>
                <span className="text-[10px] opacity-80 tracking-widest uppercase">Sync to Cloud</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
