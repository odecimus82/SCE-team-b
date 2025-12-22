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
      className={`px-4 py-1.5 rounded-full transition-all duration-300 font-bold text-sm ${
        view === target || (target === 'register' && view === 'edit')
          ? 'bg-sky-500 text-white shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden font-sans">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            <div className="text-gray-900 w-8 h-8 transform group-hover:rotate-12 transition-transform">
              {TEAM_LOGO_SVG}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black tracking-tighter text-gray-900 leading-none">CORSAIR (SCE)</h1>
              <p className="text-[8px] uppercase tracking-widest text-sky-500 font-bold">2026 TEAM BUILDING</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <NavItem target="home" label="首页" />
            <NavItem target="info" label="指南" />
            <NavItem target="register" label="报名" />
            <NavItem target="admin" label="管理" />
          </nav>

          <button 
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-b py-2 flex flex-col items-center gap-1">
            <NavItem target="home" label="首页" />
            <NavItem target="info" label="园区指南" />
            <NavItem target="register" label="我要报名" />
            <NavItem target="admin" label="管理员后台" />
          </div>
        )}
      </header>

      <main className="flex-grow">
        {view === 'home' && (
          <HomeView 
            onRegister={() => setView('register')} 
            onExplore={() => setView('info')} 
            onEdit={() => setView('edit')}
          />
        )}
        {view === 'register' && <RegistrationForm onSuccess={() => setView('home')} />}
        {view === 'edit' && <RegistrationForm editMode onSuccess={() => setView('home')} />}
        {view === 'info' && <CampusInfo />}
        {view === 'admin' && <AdminDashboard />}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 px-4 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-white w-6 h-6 opacity-60">
              {TEAM_LOGO_SVG}
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">CORSAIR (SCE) 2026</p>
              <p className="text-[10px] sm:text-xs">东莞华为松山湖 • 2026年1月10日</p>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs text-center md:text-right">
            <p className="text-sky-400 font-black uppercase tracking-tighter mb-0.5">报名截止：12/26 18:00</p>
            <p>© 2026 Corsair. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;