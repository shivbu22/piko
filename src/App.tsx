import React, { useState, useEffect } from 'react';
import { NotchShell } from './components/NotchShell';
import { 
  ShieldCheck, 
  FileText, 
  MessageSquare, 
  Mic, 
  BookOpen, 
  Shirt, 
  Moon, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [readingDoc, setReadingDoc] = useState<{ title: string; content: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click or Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setReadingDoc(null);
      }
    };
    const handleClickOutside = () => setActiveMenu(null);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const openDoc = async (filename: string) => {
    setActiveMenu(null);
    try {
      const res = await fetch(`/${filename}`);
      if (res.ok) {
        const text = await res.text();
        setReadingDoc({ title: filename, content: text });
      }
    } catch (err) {
      console.error('Failed to load doc:', err);
    }
  };

  const dispatchNookEvent = (eventName: string) => {
    setActiveMenu(null);
    window.dispatchEvent(new CustomEvent(eventName));
  };

  return (
    <div 
      className="relative min-h-screen bg-[#07080B] text-[#F8F9FA] overflow-hidden flex flex-col font-sans selection:bg-[#E07A5F] selection:text-white"
      onClick={(e) => {
        // If clicking on root background, collapse expanded notch
        if ((e.target as HTMLElement).id === 'desktop-canvas') {
          dispatchNookEvent('nook:collapse');
        }
      }}
    >
      {/* --- MACOS SEQUOIA / SONOMA ATMOSPHERIC GRADIENT WALLPAPER --- */}
      <div 
        id="desktop-canvas"
        className="absolute inset-0 cursor-default"
        style={{
          background: 'radial-gradient(circle 800px at 50% -100px, rgba(224, 122, 95, 0.18) 0%, rgba(13, 14, 20, 0.4) 50%, transparent 80%), radial-gradient(circle 900px at 80% 90%, rgba(99, 102, 241, 0.10) 0%, transparent 70%), #060709',
        }}
      >
        {/* Subtle OLED ambient grain */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* --- MACOS GLASS TOP MENU BAR --- */}
      <header 
        className="relative z-40 w-full h-7 px-4 flex items-center justify-between bg-black/60 backdrop-blur-2xl border-b border-white/[0.06] text-[11px] text-[#9DA3AE] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          {/* Apple Menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'apple' ? null : 'apple')}
              className="font-semibold text-white tracking-wide hover:text-[#E07A5F] transition-colors px-1 py-0.5 rounded"
            >
              
            </button>
            {activeMenu === 'apple' && (
              <div className="absolute top-7 left-0 w-48 bg-[#0D0E14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-fadeIn">
                <button 
                  onClick={() => openDoc('PRD.md')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white flex items-center justify-between"
                >
                  <span>About Nook</span>
                  <span className="text-[10px] text-[#636875]">v3.0</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={() => dispatchNookEvent('nook:open-settings')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-[#9DA3AE] hover:text-white flex items-center justify-between"
                >
                  <span>System Preferences...</span>
                  <span className="text-[10px] text-[#636875]">⌘,</span>
                </button>
                <button 
                  onClick={() => dispatchNookEvent('nook:toggle-focus')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-[#9DA3AE] hover:text-white"
                >
                  Sleep Pip / Focus Mode
                </button>
              </div>
            )}
          </div>

          <span className="font-bold text-white tracking-tight">Nook</span>

          {/* File Menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded"
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-7 left-0 w-52 bg-[#0D0E14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-fadeIn">
                <button 
                  onClick={() => dispatchNookEvent('nook:toggle-record')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><Mic className="w-3 h-3 text-[#E07A5F]" /> Quick Record</span>
                  <span className="text-[10px] text-[#636875] font-mono">⌘⇧Space</span>
                </button>
                <button 
                  onClick={() => dispatchNookEvent('nook:toggle-drawer')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-[#9DA3AE] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><BookOpen className="w-3 h-3 text-[#34C759]" /> Notes Drawer</span>
                  <span className="text-[10px] text-[#636875] font-mono">⌘⇧N</span>
                </button>
                <button 
                  onClick={() => dispatchNookEvent('nook:toggle-chat')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-[#9DA3AE] hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center gap-2"><MessageSquare className="w-3 h-3 text-indigo-400" /> Ask Pip</span>
                  <span className="text-[10px] text-[#636875] font-mono">⌘⇧K</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded"
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="absolute top-7 left-0 w-56 bg-[#0D0E14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-fadeIn">
                <button 
                  onClick={() => dispatchNookEvent('nook:toggle-hardware')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white flex items-center justify-between"
                >
                  <span>Toggle Notch / Island</span>
                  <span className="text-[10px] text-[#636875]">MacBook / Pill</span>
                </button>
                <button 
                  onClick={() => dispatchNookEvent('nook:toggle-focus')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-[#9DA3AE] hover:text-white flex items-center justify-between"
                >
                  <span>Toggle Focus Mode</span>
                  <span className="text-[10px] text-[#636875]">DND</span>
                </button>
              </div>
            )}
          </div>

          {/* Pip Menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'pip' ? null : 'pip')}
              className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded flex items-center gap-1"
            >
              <span>Pip</span>
              <Sparkles className="w-2.5 h-2.5 text-[#E07A5F]" />
            </button>
            {activeMenu === 'pip' && (
              <div className="absolute top-7 left-0 w-48 bg-[#0D0E14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-fadeIn">
                <button 
                  onClick={() => dispatchNookEvent('nook:boop-pip')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>Boop Pip!</span>
                </button>
                <button 
                  onClick={() => dispatchNookEvent('nook:open-outfits')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-[#9DA3AE] hover:text-white flex items-center gap-2"
                >
                  <Shirt className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Wardrobe & Outfits</span>
                </button>
                <button 
                  onClick={() => dispatchNookEvent('nook:toggle-focus')}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-[#9DA3AE] hover:text-white flex items-center gap-2"
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sleep Pip</span>
                </button>
              </div>
            )}
          </div>

          {/* Documentation Menu */}
          <div className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === 'docs' ? null : 'docs')}
              className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded flex items-center gap-1"
            >
              <span>Docs</span>
            </button>
            {activeMenu === 'docs' && (
              <div className="absolute top-7 left-0 w-52 bg-[#0D0E14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-fadeIn">
                {[
                  { file: 'PRD.md', label: 'Product Requirements (PRD)' },
                  { file: 'TRD.md', label: 'Technical Architecture (TRD)' },
                  { file: 'DESIGN.md', label: 'UI/UX Design Specification' },
                  { file: 'MASCOT.md', label: 'Pip Mascot Specification' },
                  { file: 'REQUIREMENTS.md', label: 'Functional Requirements' },
                  { file: 'ARCHITECTURE.md', label: 'System Architecture' },
                  { file: 'ROADMAP.md', label: 'Implementation Roadmap' },
                ].map((d) => (
                  <button
                    key={d.file}
                    onClick={() => openDoc(d.file)}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-[#9DA3AE] hover:text-white flex items-center justify-between"
                  >
                    <span>{d.label}</span>
                    <ChevronRight className="w-3 h-3 text-[#636875]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center hardware notch reservation */}
        <div className="w-[200px]" />

        {/* Right Menu Items: Status Indicators */}
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-1.5 text-[#34C759] text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Air-Gapped Local
          </span>
          <span className="text-[#636875]">|</span>
          <span className="text-white text-[11px]">{currentTime}</span>
        </div>
      </header>

      {/* --- THE MASTER LIQUID-GLASS NOOK NOTCH --- */}
      <NotchShell />



      {/* --- IN-APP SPECIFICATION VIEWER MODAL --- */}
      {readingDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn select-text"
          onClick={() => setReadingDoc(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[85vh] bg-[#0D0E14] border border-white/15 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E07A5F]" />
                <h3 className="text-sm font-bold text-white font-mono">{readingDoc.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#9DA3AE]">Specification</span>
              </div>
              <button
                onClick={() => setReadingDoc(null)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-[#9DA3AE] whitespace-pre-wrap selection:bg-[#E07A5F] selection:text-white custom-scrollbar">
              {readingDoc.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
