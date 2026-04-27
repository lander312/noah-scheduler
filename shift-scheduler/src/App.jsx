import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Settings, Calendar, Plus, Trash2, Calculator, X, Clock, Palette,
  ChevronDown, ChevronLeft, ChevronRight, Trophy, Award, Target, Zap, TrendingUp, UserPlus, Sparkles, Printer
} from 'lucide-react';

// --- 全局主題定義 ---
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
  sunset: {
    name: '落日 (暖橙)',
    bg: 'bg-[#FFF8F5]', 
    card: 'bg-white',
    accent: 'bg-[#FF6B4A]', 
    accentText: 'text-[#FF6B4A]',
    border: 'border-[#FFE4D9]',
    navActive: 'bg-[#E64A19]', 
    colors: ['bg-[#FF6B4A]', 'bg-[#FFB347]', 'bg-[#D35400]', 'bg-[#FFCCBC]', 'bg-[#795548]']
  },
  ocean: {
    name: '海洋 (深藍)',
    bg: 'bg-[#EBF1F6]',
    card: 'bg-white',
    accent: 'bg-[#4A90E2]',
    accentText: 'text-[#4A90E2]',
    border: 'border-[#D1E0ED]',
    navActive: 'bg-[#2C3E50]',
    colors: ['bg-[#4A90E2]', 'bg-[#50C878]', 'bg-[#FF7F50]', 'bg-[#9B59B6]', 'bg-[#95A5A6]']
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

  // 1. 班別狀態
  const [shiftTypes, setShiftTypes] = useState([
    { id: '1', name: '全班', emoji: '🌞', start: '09:00', end: '18:00', hours: 9, colorIndex: 0 },
    { id: '2', name: '午班', emoji: '🌤️', start: '12:00', end: '17:00', hours: 5, colorIndex: 1 },
    { id: '3', name: '晚班', emoji: '🌙', start: '18:00', end: '22:00', hours: 4, colorIndex: 2 },
    { id: '4', name: '休假', emoji: '🌴', start: '00:00', end: '00:00', hours: 0, colorIndex: 4 },
  ]);
  const [newShift, setNewShift] = useState({ name: '', emoji: '✨', start: '09:00', end: '18:00' });

  // 2. 員工狀態
  const [employees, setEmployees] = useState([
    { id: '1', name: '諾亞', schedule: {} },
    { id: '2', name: '樂寶', schedule: {} },
  ]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const getDateKey = (day) => `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const calculateHours = (start, end) => {
    if (start === end) return 0;
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diff = (eH * 60 + eM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60;
    return parseFloat((diff / 60).toFixed(1));
  };

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

  return (
    <div className={`min-h-screen ${theme.bg} text-slate-800 p-4 md:p-8 transition-colors duration-700`}>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #eee !important; border-radius: 0 !important; width: 100% !important; }
          .print-table { font-size: 10px !important; width: 100% !important; }
          .print-table td, .print-table th { padding: 4px !important; height: auto !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      {/* Header */}
      <header className="max-w-[1600px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div className="flex items-center gap-4 text-left mr-auto">
          <div className={`bg-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-3xl border ${theme.border}`}>🗓️</div>
          <div className="text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-800">NOAH <span className="font-light text-slate-400 italic">v2026</span></h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-left">智能排班與時數算力中心</p>
          </div>
        </div>
        <nav className={`flex bg-white p-1.5 rounded-2xl shadow-sm border ${theme.border}`}>
          {['schedule', 'summary', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl text-base font-black transition-all ${activeTab === tab ? `${theme.navActive} text-white shadow-lg` : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'schedule' ? '排班面板' : tab === 'summary' ? '時數結算' : '系統設定'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-8">
        {activeTab === 'schedule' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
              <div className={`bg-white md:col-span-2 rounded-[2.5rem] p-8 shadow-sm border ${theme.border} flex flex-col justify-center`}>
                <h3 className="text-slate-400 text-sm font-black uppercase mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" /> 本月榮譽榜 (時數排行)
                </h3>
                <div className="flex gap-12">
                  {leaderboard.slice(0, 3).map((emp, i) => (
                    <div key={emp.id} className="text-center group">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                      <div className="text-xl font-black text-slate-800">{emp.name}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{emp.totalHours}H 累計</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${theme.navActive} text-white rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-center border border-slate-700`}>
                <span className="text-xs font-black opacity-50 uppercase mb-2 text-left">本月基準工時目標</span>
                <div className="text-5xl font-black text-left">{settings.baseHours}<span className="text-xl font-light ml-2 opacity-60">Hours</span></div>
              </div>
              <div className={`bg-white rounded-[2.5rem] p-8 shadow-sm border ${theme.border} flex flex-col justify-center`}>
                <span className="text-slate-400 text-xs font-black uppercase mb-2 text-left">成員總數統計</span>
                <div className="text-5xl font-black text-slate-800 text-left">{employees.length}<span className="text-lg font-light ml-2 text-slate-400">Members</span></div>
              </div>
            </div>

            <div className={`bg-white rounded-[3rem] shadow-sm border ${theme.border} overflow-hidden print-card`}>
              <div className="p-8 border-b flex flex-wrap items-center justify-between gap-8 bg-black/[0.01] no-print">
                <div className="flex items-center bg-white rounded-2xl shadow-sm border p-1.5">
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth-2, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronLeft size={24}/></button>
                  <div className="px-10 text-2xl font-black text-slate-700">{currentYear} / {String(currentMonth).padStart(2,'0')}</div>
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronRight size={24}/></button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-xl text-sm font-black hover:bg-slate-200 transition-all">
                    <Printer size={18}/> 打印 A4 報表
                  </button>
                  <div className="flex flex-wrap gap-3 items-center bg-white p-2 rounded-2xl border shadow-inner">
                    {shiftTypes.map(s => (
                      <button key={s.id} onClick={() => setQuickAssignMode(quickAssignMode === s.id ? null : s.id)} className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${quickAssignMode === s.id ? `${theme.colors[s.colorIndex % 5]} text-white shadow-lg scale-110` : 'hover:bg-slate-50 text-slate-500'}`}>
                        <span className="text-xl">{s.emoji}</span> {s.name}
                      </button>
                    ))}
                    <button onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')} className={`px-6 py-3 rounded-xl text-sm font-black ${quickAssignMode === 'clear' ? 'bg-rose-500 text-white' : 'text-slate-300'}`}><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full border-separate border-spacing-0 text-left print-table">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="sticky left-0 top-0 z-40 bg-white/95 backdrop-blur-md p-6 text-xs font-black uppercase text-slate-400 border-b border-r min-w-[180px] text-left">成員名冊 (⚡一鍵填滿)</th>
                      {Array.from({ length: daysInMonth }).map((_, i) => (
                        <th key={i} className="top-0 p-4 text-sm font-black border-b text-center min-w-[55px] text-slate-400">{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((emp) => (
                      <tr key={emp.id} className="group transition-colors hover:bg-slate-50/30">
                        <td className="sticky left-0 z-30 bg-white/95 backdrop-blur-md p-6 border-r border-b shadow-[5px_0_15px_rgba(0,0,0,0.03)] text-left">
                          <div className="flex flex-col gap-3 text-left">
                            <div className="font-black text-2xl text-slate-800 tracking-tight text-left">{emp.name}</div>
                            <button onClick={() => fillMonth(emp.id, quickAssignMode)} className="no-print flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 text-xs font-black text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200">
                              <Zap size={14} fill="currentColor"/> 一鍵填滿
                            </button>
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const k = getDateKey(day);
                          const sId = emp.schedule[k];
                          const s = shiftTypes.find(x => x.id === sId);
                          return (
                            <td key={day} className={`p-0 border-b border-r border-slate-50 transition-colors`}>
                              <button onClick={() => quickAssignMode && setSchedule(emp.id, k, quickAssignMode === 'clear' ? null : quickAssignMode)} className={`w-full h-20 flex items-center justify-center text-4xl transition-all ${s ? theme.colors[s.colorIndex % 5] + " text-white shadow-inner" : "bg-transparent hover:bg-black/[0.02]"}`}>
                                {s ? s.emoji : '·'}
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
          </>
        )}

        {/* --- 系統設定 (Emoji 選擇器回歸) --- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
            <div className="space-y-8">
              {/* 視覺化主題選擇器 */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 text-left"><Palette className={theme.accentText} size={24}/> 佈景主題切換</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                  {Object.entries(THEMES).map(([id, t]) => (
                    <button key={id} onClick={() => setThemeId(id)} className={`relative p-5 rounded-[2rem] border-4 transition-all duration-300 flex flex-col items-start gap-4 ${themeId === id ? 'border-slate-800 bg-white shadow-xl scale-105' : 'border-white bg-slate-50 opacity-70 hover:opacity-100'}`}>
                      <div className="flex gap-2">
                        <div className={`w-8 h-8 rounded-full ${t.accent} shadow-inner`}></div>
                        <div className={`w-8 h-8 rounded-full ${t.colors[1]} opacity-60`}></div>
                      </div>
                      <span className="text-base font-black text-slate-800 leading-tight">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 班別管理 (含 Emoji 選擇器) */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-left">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 text-left"><Clock className="text-orange-500" size={24}/> 班別時數設定</h3>
                <div className="flex flex-col gap-6 mb-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner text-left">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 px-2 uppercase text-left">班別名稱</label>
                        <input type="text" value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} placeholder="如:全班" className="bg-white px-5 py-4 rounded-2xl font-bold" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 px-2 uppercase text-left">代表圖示</label>
                        <input type="text" value={newShift.emoji} onChange={e => setNewShift({...newShift, emoji: e.target.value})} className="bg-white px-5 py-4 rounded-2xl font-black text-2xl text-center" />
                      </div>
                   </div>

                   {/* --- Emoji 快捷選單 --- */}
                   <div className="bg-white/50 p-4 rounded-2xl border border-slate-200">
                      <div className="text-[10px] font-black text-slate-300 uppercase mb-3 tracking-widest text-center underline underline-offset-4 decoration-slate-100">點擊快速選擇圖示</div>
                      <div className="space-y-4">
                        {[
                          { label: '天氣', icons: ['🌞', '🌤️', '⛅', '🌥️', '☁️', '🌧️', '🌙', '⭐'] },
                          { label: '工作', icons: ['💼', '💻', '📞', '📝', '🔨', '🛠️', '🎨', '🚀'] },
                          { label: '商務', icons: ['📊', '📈', '💰', '🎯', '🤝', '🏢', '🏗️', '🏠'] },
                          { label: '旅行', icons: ['🌴', '🏖️', '✈️', '🚗', '🏔️', '🚂', '🏨', '🎒'] }
                        ].map((group) => (
                          <div key={group.label} className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 min-w-[35px]">{group.label}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {group.icons.map(icon => (
                                <button key={icon} onClick={() => setNewShift({...newShift, emoji: icon})} className="w-10 h-10 flex items-center justify-center text-xl bg-white rounded-xl shadow-sm hover:scale-110 border border-slate-100">{icon}</button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 px-2 uppercase text-left">開始時間</label>
                        <input type="time" value={newShift.start} onChange={e => setNewShift({...newShift, start: e.target.value})} className="bg-white px-5 py-4 rounded-2xl font-black text-lg" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 px-2 uppercase text-left">結束時間</label>
                        <input type="time" value={newShift.end} onChange={e => setNewShift({...newShift, end: e.target.value})} className="bg-white px-5 py-4 rounded-2xl font-black text-lg" />
                      </div>
                   </div>
                   <button 
                     onClick={() => {
                       if(!newShift.name) return;
                       const hrs = calculateHours(newShift.start, newShift.end);
                       setShiftTypes([...shiftTypes, { ...newShift, id: Date.now().toString(), hours: hrs, colorIndex: shiftTypes.length }]);
                       setNewShift({ name: '', emoji: '✨', start: '09:00', end: '18:00' });
                     }}
                     className={`${theme.navActive} text-white py-5 rounded-[2rem] font-black text-xl shadow-xl`}
                   >
                     確認新增班別
                   </button>
                </div>
                <div className="space-y-3">
                  {shiftTypes.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] group border border-transparent hover:border-slate-200">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">{s.emoji}</span>
                        <div>
                          <div className="font-black text-2xl text-slate-700">{s.name}</div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.start} - {s.end} ({s.hours}小時)</div>
                        </div>
                      </div>
                      <button onClick={() => setShiftTypes(shiftTypes.filter(x => x.id !== s.id))} className="text-slate-200 hover:text-rose-500 p-4"><Trash2 size={24}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8 text-left">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-left">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 text-left"><Target className="text-indigo-500" size={24}/> 營運計算基準</h3>
                <div className="space-y-8 text-left">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner text-left">
                    <label className="text-xl font-black text-slate-500 uppercase mb-4 block underline underline-offset-8 decoration-slate-200 text-left">每月基準工時設定</label>
                    <input type="number" value={settings.baseHours} onChange={e => setSettings({...settings, baseHours: Number(e.target.value)})} className="w-full bg-transparent text-5xl font-black text-slate-800 focus:outline-none" />
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner text-left">
                    <label className="text-xl font-black text-slate-500 uppercase mb-4 block underline underline-offset-8 decoration-slate-200 text-left">加班費率設定 (NT$)</label>
                    <input type="number" value={settings.overtimeRate} onChange={e => setSettings({...settings, overtimeRate: Number(e.target.value)})} className="w-full bg-transparent text-5xl font-black text-slate-800 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-left">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 text-left"><UserPlus className="text-emerald-500" size={24}/> 員工名錄管理</h3>
                <div className="flex gap-4 mb-8 text-left">
                  <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="新員工姓名..." className="flex-1 bg-slate-50 px-8 py-5 rounded-2xl text-xl font-bold focus:outline-none" />
                  <button onClick={() => { if(!newEmpName)return; setEmployees([...employees,{id:Date.now().toString(),name:newEmpName,schedule:{}}]);setNewEmpName(''); }} className={`${theme.navActive} text-white px-10 rounded-2xl font-black text-xl`}>新增</button>
                </div>
                <div className="space-y-3">
                  {employees.map(e => (
                    <div key={e.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200">
                      <span className="font-black text-2xl text-slate-700">{e.name}</span>
                      <button onClick={() => setEmployees(employees.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={28}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 animate-in fade-in duration-500 text-left">
             <h3 className="text-3xl font-black text-slate-800 mb-12 flex items-center gap-4 text-left"><Calculator size={36} className="text-amber-500" /> {currentMonth} 月薪資結算表</h3>
             <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                    <th className="pb-8 pl-6 text-left">員工成員</th>
                    <th className="pb-8 text-left">累計總時數</th>
                    <th className="pb-8 text-left">加班狀況</th>
                    <th className="pb-8 text-right pr-6">預估津貼 (NT$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaderboard.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors text-left">
                      <td className="py-10 pl-6 text-left"><div className="text-3xl font-black text-slate-800">{emp.name}</div></td>
                      <td className="py-10 text-left"><div className="text-3xl font-bold">{emp.totalHours}H</div></td>
                      <td className="py-10 text-left">
                        <span className={`px-6 py-2.5 rounded-2xl text-sm font-black border ${emp.overtime > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                          {emp.overtime > 0 ? `🔥 超額工時 + ${emp.overtime} H` : '工時正常'}
                        </span>
                      </td>
                      <td className="py-10 text-right pr-6 font-mono font-black text-4xl text-slate-900">$ {emp.overtimePay.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </main>

      <footer className="max-w-[1600px] mx-auto mt-20 pt-10 border-t border-slate-200 pb-12 no-print text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2 text-left">
            <div className="flex items-center gap-3 text-left">
              <span className={`px-2 py-0.5 ${theme.navActive} text-white text-[10px] font-black rounded-md tracking-widest uppercase`}>核心價值</span>
              <span className="text-xs font-bold text-slate-500 tracking-widest text-left">廣告壓克力展示/辦公文具用品 ● 精選優質材料，融匠心設計，永續工藝，營造藝術品之美。</span>
            </div>
            <a href="https://noah999.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">© 2026</span>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors decoration-slate-300 underline-offset-4 group-hover:underline">NOAHSHOP SYSTEM.</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ALL RIGHTS RESERVED.</span>
            </a>
          </div>
          <a href="https://noah999.com" target="_blank" rel="noopener noreferrer" className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all shadow-sm no-print`}>瀏覽官方網站 →</a>
        </div>
      </footer>
    </div>
  );
};

export default App;