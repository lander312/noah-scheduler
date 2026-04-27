import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Settings, Calendar, Plus, Trash2, Calculator, X, Clock, Palette,
  ChevronDown, ChevronLeft, ChevronRight, Trophy, Award, Target, Zap, TrendingUp, UserPlus, Sparkles, Printer
} from 'lucide-react';

// --- 全局主題定義 (同步背景與強調色) ---
const THEMES = {
  morandi: {
    name: '莫蘭迪 (優雅)',
    bg: 'bg-[#F8F7F5]',
    card: 'bg-white',
    accent: 'bg-[#8F9E93]',
    accentText: 'text-[#8F9E93]',
    border: 'border-[#F0EBE5]',
    navActive: 'bg-slate-800',
    colors: ['bg-[#8F9E93]', 'bg-[#D4A373]', 'bg-[#778DA9]', 'bg-[#BC8F8F]', 'bg-[#A5A5A5]']
  },
  ocean: {
    name: '海洋之聲 (深藍)',
    bg: 'bg-[#EBF1F6]',
    card: 'bg-white',
    accent: 'bg-[#4A90E2]',
    accentText: 'text-[#4A90E2]',
    border: 'border-[#D1E0ED]',
    navActive: 'bg-[#2C3E50]',
    colors: ['bg-[#4A90E2]', 'bg-[#50C878]', 'bg-[#FF7F50]', 'bg-[#9B59B6]', 'bg-[#95A5A6]']
  },
  forest: {
    name: '日落森林 (暖綠)',
    bg: 'bg-[#F1F3EA]',
    card: 'bg-white',
    accent: 'bg-[#6B8E23]',
    accentText: 'text-[#6B8E23]',
    border: 'border-[#E2E8D5]',
    navActive: 'bg-[#3E4A24]',
    colors: ['bg-[#6B8E23]', 'bg-[#CD853F]', 'bg-[#4682B4]', 'bg-[#DB7093]', 'bg-[#7F8C8D]']
  }
};

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [themeId, setThemeId] = useState('morandi');
  const [settings, setSettings] = useState({ baseHours: 176, overtimeRate: 200 });
  const [quickAssignMode, setQuickAssignMode] = useState(null);
  const [newEmpName, setNewEmpName] = useState('');
  
  const theme = THEMES[themeId];

  const [shiftTypes, setShiftTypes] = useState([
    { id: '1', name: '全班', emoji: '🌞', hours: 8, colorIndex: 0 },
    { id: '2', name: '午班', emoji: '🌤️', hours: 4, colorIndex: 1 },
    { id: '3', name: '晚班', emoji: '🌙', hours: 4, colorIndex: 2 },
    { id: '4', name: '休假', emoji: '🌴', hours: 0, colorIndex: 4 },
  ]);

  const [employees, setEmployees] = useState([
    { id: '1', name: '諾亞', schedule: {} },
    { id: '2', name: '樂寶', schedule: {} },
  ]);

  // --- 自動月份計算 (核心邏輯：自動處理大小月與閏月) ---
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const getDateKey = (day) => `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const setSchedule = useCallback((empId, dateKey, shiftId) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const newSchedule = { ...emp.schedule };
        if (shiftId === null) delete newSchedule[dateKey];
        else newSchedule[dateKey] = shiftId;
        return { ...emp, schedule: newSchedule };
      }
      return emp;
    }));
  }, []);

  const fillMonth = (empId, shiftId) => {
    if (!shiftId) return;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const newSchedule = { ...emp.schedule };
        for (let i = 1; i <= daysInMonth; i++) {
          const key = getDateKey(i);
          if (shiftId === 'clear') delete newSchedule[key];
          else newSchedule[key] = shiftId;
        }
        return { ...emp, schedule: newSchedule };
      }
      return emp;
    }));
  };

  const stats = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}-`;
    return employees.map(emp => {
      let totalHours = 0;
      Object.entries(emp.schedule).forEach(([k, sId]) => {
        if (k.startsWith(prefix)) {
          const s = shiftTypes.find(x => x.id === sId);
          if (s) totalHours += Number(s.hours);
        }
      });
      const overtime = Math.max(0, totalHours - settings.baseHours);
      return { ...emp, totalHours, overtime, overtimePay: overtime * settings.overtimeRate };
    });
  }, [employees, shiftTypes, settings, currentYear, currentMonth]);

  const leaderboard = useMemo(() => [...stats].sort((a, b) => b.totalHours - a.totalHours), [stats]);

  // --- 列印功能 ---
  const handlePrint = () => window.print();

  return (
    <div className={`min-h-screen ${theme.bg} text-slate-800 p-4 md:p-8 transition-colors duration-700`}>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-card { box-shadow: none !important; border: 1px solid #eee !important; border-radius: 0 !important; width: 100% !important; }
          .print-table { font-size: 10px !important; width: 100% !important; }
          .print-table td, .print-table th { padding: 4px !important; height: auto !important; border: 1px solid #ccc !important; }
          .print-name { font-size: 14px !important; min-width: 80px !important; }
        }
      `}</style>

      {/* Header */}
      <header className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div className="flex items-center gap-4 text-left mr-auto">
          <div className={`bg-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-3xl border ${theme.border}`}>🗓️</div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">NOAH <span className="font-light text-slate-400 italic">v2026</span></h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">智能排班與時數算力中心</p>
          </div>
        </div>
        <nav className={`flex bg-white p-1.5 rounded-2xl shadow-sm border ${theme.border}`}>
          {['schedule', 'summary', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl text-base font-black transition-all ${activeTab === tab ? `${theme.navActive} text-white` : 'text-slate-400'}`}>
              {tab === 'schedule' ? '排班面板' : tab === 'summary' ? '時數結算' : '系統設定'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-6">
        {/* Bento Widgets */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
            <div className={`bg-white md:col-span-2 rounded-[2rem] p-6 shadow-sm border ${theme.border}`}>
              <h3 className="text-slate-400 text-xs font-black uppercase mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" /> 本月榮譽榜
              </h3>
              <div className="flex gap-8">
                {leaderboard.slice(0, 3).map((emp, i) => (
                  <div key={emp.id} className="text-center">
                    <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                    <div className="text-lg font-black">{emp.name}</div>
                    <div className="text-[10px] font-bold text-slate-400">{emp.totalHours}H累計</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${theme.navActive} text-white rounded-[2rem] p-6 shadow-xl flex flex-col justify-center`}>
              <span className="text-[10px] opacity-50 uppercase">基準工時目標</span>
              <div className="text-4xl font-black">{settings.baseHours}H</div>
            </div>
            <div className={`bg-white rounded-[2rem] p-6 shadow-sm border ${theme.border} flex flex-col justify-center`}>
              <span className="text-slate-400 text-[10px]">成員總計</span>
              <div className="text-4xl font-black">{employees.length}</div>
            </div>
          </div>
        )}

        {/* --- 排班面板 --- */}
        {activeTab === 'schedule' && (
          <div className={`bg-white rounded-[2.5rem] shadow-sm border ${theme.border} overflow-hidden print-card`}>
            <div className="p-6 border-b flex flex-wrap items-center justify-between gap-6 bg-black/[0.01] no-print">
              <div className="flex items-center bg-white rounded-xl shadow-sm border p-1">
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth-2, 1))} className="p-2"><ChevronLeft/></button>
                <div className="px-6 font-black text-lg">{currentYear} / {currentMonth}</div>
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth, 1))} className="p-2"><ChevronRight/></button>
              </div>
              <div className="flex gap-3">
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">
                  <Printer size={14}/> 打印 A4 報表
                </button>
                <div className="flex flex-wrap gap-2 items-center bg-white p-1 rounded-2xl border">
                  {shiftTypes.map(s => (
                    <button key={s.id} onClick={() => setQuickAssignMode(quickAssignMode === s.id ? null : s.id)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${quickAssignMode === s.id ? `${theme.colors[s.colorIndex % 5]} text-white scale-105` : 'hover:bg-slate-50'}`}>
                      {s.emoji} {s.name}
                    </button>
                  ))}
                  <button onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')} className={`px-4 py-2 rounded-xl text-xs font-black ${quickAssignMode === 'clear' ? 'bg-rose-500 text-white' : 'text-slate-300'}`}><Trash2 size={14}/></button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full border-separate border-spacing-0 text-left print-table">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="sticky left-0 top-0 z-40 bg-white p-4 text-[10px] font-black uppercase text-slate-400 border-b border-r min-w-[150px] print-name">成員名冊</th>
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <th key={i} className="top-0 p-3 text-xs font-black border-b text-center min-w-[45px] text-slate-400">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="sticky left-0 z-30 bg-white p-4 border-r border-b shadow-[4px_0_10px_rgba(0,0,0,0.02)] print-name">
                        <div className="font-black text-xl mb-1">{emp.name}</div>
                        <button onClick={() => fillMonth(emp.id, quickAssignMode)} className="no-print flex items-center gap-1 py-1 px-3 rounded-lg bg-slate-100 text-[10px] font-black hover:bg-indigo-50 transition-all">
                          <Zap size={10} fill="currentColor"/>一鍵填滿
                        </button>
                      </td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const k = getDateKey(day);
                        const sId = emp.schedule[k];
                        const s = shiftTypes.find(x => x.id === sId);
                        return (
                          <td key={day} className={`p-0 border-b border-r border-slate-50`}>
                            <button onClick={() => quickAssignMode && setSchedule(emp.id, k, quickAssignMode === 'clear' ? null : quickAssignMode)} className={`w-full h-16 flex items-center justify-center text-3xl transition-all ${s ? theme.colors[s.colorIndex % 5] + " text-white" : "bg-transparent"}`}>
                              {s ? s.emoji : ''}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 系統設定 (主題同步優化) --- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className={`bg-white p-10 rounded-[2.5rem] border ${theme.border} shadow-sm`}>
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Palette className={theme.accentText}/> 主題與營運基準</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-10">
                {Object.entries(THEMES).map(([id, t]) => (
                  <button key={id} onClick={() => setThemeId(id)} className={`p-4 rounded-2xl border-2 font-black transition-all ${themeId === id ? `border-slate-800 shadow-md scale-105` : 'border-slate-100 opacity-60'}`}>
                    <div className="text-xs">{t.name}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                  <label className="text-xl font-black text-slate-500 uppercase mb-4 block">每月基準工時設定</label>
                  <input type="number" value={settings.baseHours} onChange={e => setSettings({...settings, baseHours: Number(e.target.value)})} className="w-full bg-transparent text-5xl font-black text-slate-800 focus:outline-none" />
                </div>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                  <label className="text-xl font-black text-slate-500 uppercase mb-4 block">加班費率設定 (時薪)</label>
                  <input type="number" value={settings.overtimeRate} onChange={e => setSettings({...settings, overtimeRate: Number(e.target.value)})} className="w-full bg-transparent text-5xl font-black text-slate-800 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className={`bg-white p-10 rounded-[2.5rem] border ${theme.border} shadow-sm`}>
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><UserPlus className="text-emerald-500"/> 員工名錄管理</h3>
              <div className="flex gap-4 mb-8">
                <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="新員工姓名" className="flex-1 bg-slate-50 p-5 rounded-2xl font-bold text-xl" />
                <button onClick={() => { if(!newEmpName)return; setEmployees([...employees,{id:Date.now().toString(),name:newEmpName,schedule:{}}]);setNewEmpName(''); }} className={`${theme.navActive} text-white px-10 rounded-2xl font-black text-xl shadow-lg`}>新增</button>
              </div>
              <div className="space-y-3">
                {employees.map(e => (
                  <div key={e.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200 transition-all">
                    <span className="font-black text-2xl text-slate-700">{e.name}</span>
                    <button onClick={() => setEmployees(employees.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={24}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 時數結算 --- */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
             <h3 className="text-3xl font-black text-slate-800 mb-10">薪資結算總表</h3>
             <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-xs font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-6 pl-4">成員</th>
                    <th className="pb-6">總工時</th>
                    <th className="pb-6">加班狀況</th>
                    <th className="pb-6 text-right pr-4">加班津貼</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leaderboard.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-8 pl-4 font-black text-2xl">{emp.name}</td>
                      <td className="py-8 text-2xl font-bold">{emp.totalHours}H</td>
                      <td className="py-8">
                        <span className={`px-4 py-2 rounded-xl text-sm font-black ${emp.overtime > 0 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                          {emp.overtime > 0 ? `+${emp.overtime}H` : '正常'}
                        </span>
                      </td>
                      <td className="py-8 text-right pr-4 font-black text-3xl text-slate-900">$ {emp.overtimePay.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </main>

      {/* Footer 品牌標語與連結 */}
      <footer className="max-w-[1600px] mx-auto mt-20 pt-10 border-t border-slate-200 pb-12 no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 ${theme.navActive} text-white text-[10px] font-black rounded-md tracking-widest uppercase`}>核心價值</span>
              <span className="text-xs font-bold text-slate-500 tracking-widest">精湛工藝 · 數位管理 · 卓越生活</span>
            </div>
            <a href="https://noah999.com.tw" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">© 2026</span>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors decoration-slate-300 underline-offset-4 group-hover:underline">NOAHSHOP SYSTEM.</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ALL RIGHTS RESERVED.</span>
            </a>
          </div>
          <a href="https://noah999.com.tw" target="_blank" rel="noopener noreferrer" className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all shadow-sm`}>瀏覽官方網站 →</a>
        </div>
      </footer>
    </div>
  );
};

export default App;