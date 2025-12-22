
import React, { useState } from 'react';
import { AppView } from './types';
import { TEAM_LOGO_SVG } from './constants';
import HomeView from './components/HomeView';
import RegistrationForm from './components/RegistrationForm';
import CampusInfo from './components/CampusInfo';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavItem: React.FC<{ target: AppView; label: string }> = ({ target, label }) => (
    <button
      onClick={() => { setView(target); setIsMenuOpen(false); }}
      className={`px-6 py-2 rounded-full transition-all duration-300 font-bold ${
        view === target || (target === 'register' && view === 'edit')
          ? 'bg-sky-500 text-white shadow-md scale-105' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden font-sans">
      <div className="fixed top-0 right-0 w-96 h-96 bg-sky-100 opacity-20 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-slate-200 opacity-30 blur-3xl -z-10 rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            <div className="text-gray-900 transform group-hover:scale-110 transition-transform">
              {TEAM_LOGO_SVG}
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tighter text-gray-900 leading-none">CORSAIR (SCE)</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sky-500 font-black">2026 TEAM BUILDING</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-2">
            <NavItem target="home" label="首页" />
            <NavItem target="info" label="园区指南" />
            <NavItem target="register" label="报名" />
            <NavItem target="admin" label="管理" />
          </nav>

          <button 
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-b p-4 flex flex-col gap-2 animate-in slide-in-from-top duration-300">
            <NavItem target="home" label="首页" />
            <NavItem target="info" label="园区指南" />
            <NavItem target="register" label="报名" />
            <NavItem target="admin" label="管理" />
          </div>
        )}
      </header>

      <main className="flex-grow">
        {view === 'home' && <HomeView onRegister={() => setView('register')} onExplore={() => setView('info')} />}
        {view === 'register' && <RegistrationForm onSuccess={() => setView('home')} />}
        {view === 'edit' && <RegistrationForm editMode onSuccess={() => setView('home')} />}
        {view === 'info' && <CampusInfo />}
        {view === 'admin' && <AdminDashboard />}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="text-white w-8 h-8 opacity-70">
              {TEAM_LOGO_SVG}
            </div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider">CORSAIR (SCE) 2026 团建活动</p>
              <p className="text-sm">东莞华为松山湖基地 • 2026年1月10日</p>
            </div>
          </div>
          <div className="text-sm text-center md:text-right">
            <p className="text-sky-500 font-black uppercase tracking-widest text-[10px] mb-2">报名截止：12/26 18:00</p>
            <p>随行儿童：由公司统一支持</p>
            <p className="mt-2 text-gray-500 font-medium">© 2026 Corsair. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
