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

  // --- 班別狀態管理 (恢復刪除與管理功能) ---
  const [shiftTypes, setShiftTypes] = useState([
    { id: '1', name: '全班', emoji: '🌞', start: '09:00', end: '18:00', hours: 9, colorIndex: 0 },
    { id: '2', name: '午班', emoji: '🌤️', start: '12:00', end: '17:00', hours: 5, colorIndex: 1 },
    { id: '3', name: '晚班', emoji: '🌙', start: '18:00', end: '22:00', hours: 4, colorIndex: 2 },
    { id: '4', name: '休假', emoji: '🌴', start: '00:00', end: '00:00', hours: 0, colorIndex: 4 },
  ]);
  const [newShift, setNewShift] = useState({ name: '', emoji: '✨', start: '09:00', end: '18:00' });

  const [employees, setEmployees] = useState([
    { id: '1', name: '諾亞', schedule: {} },
    { id: '2', name: '樂寶', schedule: {} },
  ]);

  // 時間與月份計算
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
    <div className={`min-h-screen ${theme.bg} text-slate-800 p-4 md:p-8 transition-colors duration-700 font-sans`}>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #eee !important; width: 100% !important; }
          .print-table { font-size: 10px !important; }
        }
      `}</style>

      {/* Header - 標題上下對調優化 */}
      <header className="max-w-[1600px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6 no-print text-left">
        <div className="flex items-center gap-4 mr-auto">
          <div className={`bg-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-3xl border ${theme.border}`}>🗓️</div>
          <div className="text-left flex flex-col">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] order-1 mb-1">智能排班與時數算力中心</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-800 order-2">NOAH <span className="font-light text-slate-400 italic">v2026</span></h1>
          </div>
        </div>
        <nav className={`flex bg-white p-2 rounded-2xl shadow-sm border ${theme.border}`}>
          {['schedule', 'summary', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl text-lg font-black transition-all ${activeTab === tab ? `${theme.navActive} text-white shadow-lg scale-105` : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'schedule' ? '排班面板' : tab === 'summary' ? '時數結算' : '系統設定'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-8">
        {activeTab === 'schedule' && (
          <>
            {/* Bento Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
              <div className={`bg-white md:col-span-2 rounded-[2.5rem] p-8 shadow-sm border ${theme.border} flex flex-col justify-center`}>
                <h3 className="text-slate-400 text-sm font-black uppercase mb-6 flex items-center gap-2">🏆 本月榮譽榜</h3>
                <div className="flex gap-12">
                  {leaderboard.slice(0, 3).map((emp, i) => (
                    <div key={emp.id} className="text-center">
                      <div className="text-4xl mb-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                      <div className="text-2xl font-black text-slate-800">{emp.name}</div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{emp.totalHours}H 累計</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${theme.navActive} text-white rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-center`}>
                <span className="text-sm font-black opacity-50 uppercase mb-2">本月基準工時目標</span>
                <div className="text-5xl font-black">{settings.baseHours}<span className="text-xl font-light ml-2 opacity-60">Hours</span></div>
              </div>
              <div className={`bg-white rounded-[2.5rem] p-8 shadow-sm border ${theme.border} flex flex-col justify-center`}>
                <span className="text-slate-400 text-sm font-black uppercase mb-2">成員總數統計</span>
                <div className="text-5xl font-black text-slate-800">{employees.length}</div>
              </div>
            </div>

            {/* 排班面板 */}
            <div className={`bg-white rounded-[3rem] shadow-sm border ${theme.border} overflow-hidden print-card`}>
              <div className="p-8 border-b flex flex-wrap items-center justify-between gap-8 bg-black/[0.01] no-print">
                <div className="flex items-center bg-white rounded-2xl shadow-sm border p-2">
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth-2, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronLeft size={28}/></button>
                  <div className="px-10 text-3xl font-black text-slate-700">{currentYear} / {String(currentMonth).padStart(2,'0')}</div>
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronRight size={28}/></button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-4 bg-slate-100 rounded-xl text-base font-black hover:bg-slate-200 transition-all">
                    <Printer size={20}/> 打印 A4 報表
                  </button>
                  <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl border shadow-inner">
                    {shiftTypes.map(s => (
                      <button key={s.id} onClick={() => setQuickAssignMode(quickAssignMode === s.id ? null : s.id)} className={`px-6 py-3 rounded-xl text-base font-black transition-all ${quickAssignMode === s.id ? `${theme.colors[s.colorIndex % 5]} text-white shadow-lg scale-110` : 'hover:bg-slate-50 text-slate-500'}`}>
                        <span className="text-2xl">{s.emoji}</span> {s.name}
                      </button>
                    ))}
                    <button onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')} className={`px-6 py-3 rounded-xl text-base font-black ${quickAssignMode === 'clear' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-300'}`}><Trash2 size={22}/></button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full border-separate border-spacing-0 text-left print-table">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="sticky left-0 top-0 z-40 bg-white/95 backdrop-blur-md p-6 text-sm font-black uppercase text-slate-400 border-b border-r min-w-[200px]">成員名冊 (⚡一鍵填滿)</th>
                      {Array.from({ length: daysInMonth }).map((_, i) => (
                        <th key={i} className="top-0 p-4 text-base font-black border-b text-center min-w-[60px] text-slate-400">{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((emp) => (
                      <tr key={emp.id} className="group transition-colors hover:bg-slate-50/30">
                        <td className="sticky left-0 z-30 bg-white/95 backdrop-blur-md p-6 border-r border-b shadow-[5px_0_15px_rgba(0,0,0,0.03)]">
                          <div className="flex flex-col gap-4 text-left">
                            <div className="font-black text-3xl text-slate-800">{emp.name}</div>
                            <button onClick={() => fillMonth(emp.id, quickAssignMode)} className="no-print flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 text-sm font-black text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200">
                              <Zap size={16} fill="currentColor"/> 一鍵填滿
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
                              <button onClick={() => quickAssignMode && setSchedule(emp.id, k, quickAssignMode === 'clear' ? null : quickAssignMode)} className={`w-full h-24 flex items-center justify-center text-5xl transition-all ${s ? theme.colors[s.colorIndex % 5] + " text-white shadow-inner" : "bg-transparent hover:bg-black/[0.02]"}`}>
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

        {/* --- 時數結算 (文字放大版) --- */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 animate-in fade-in duration-500 text-left">
             <div className="flex justify-between items-end mb-12">
               <h3 className="text-4xl font-black text-slate-800 flex items-center gap-4 text-left">
                 <Calculator size={48} className="text-amber-500" /> {currentMonth} 月營運績效與酬勞結算
               </h3>
               <div className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">NoahShop Management</div>
             </div>

             <table className="w-full text-left border-separate border-spacing-y-6">
                <thead>
                  <tr className="text-[14px] font-black text-slate-400 uppercase tracking-[0.15em] opacity-80">
                    <th className="pb-4 pl-10">合作夥伴成員</th>
                    <th className="pb-4">累計總時數</th>
                    <th className="pb-4">時數結構 (基礎 + 協力精進)</th>
                    <th className="pb-4 text-right pr-10">預估優化津貼 (NT$)</th>
                  </tr>
                </thead>
                <tbody className="text-left">
                  {leaderboard.map(emp => (
                    <tr key={emp.id} className="group transition-all hover:translate-x-1">
                      <td className="py-10 pl-10 bg-slate-50/50 rounded-l-[2.5rem] border-y border-l border-slate-100">
                        <div className="text-4xl font-black text-slate-800 tracking-tight">{emp.name}</div>
                        <div className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest opacity-70">Professional Member</div>
                      </td>
                      <td className="py-10 bg-slate-50/50 border-y border-slate-100">
                        <div className="text-4xl font-bold text-slate-800 font-mono">{emp.totalHours}<span className="text-xl ml-1 text-slate-400 font-sans">H</span></div>
                      </td>
                      <td className="py-10 bg-slate-50/50 border-y border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-500 uppercase mb-2">基礎時數</span>
                            <div className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-700 shadow-sm">{Math.min(emp.totalHours, settings.baseHours)} H</div>
                          </div>
                          <Plus size={16} className="text-slate-300 mt-6" />
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-amber-600 uppercase mb-2 font-bold">協力精進</span>
                            <div className={`px-6 py-2 rounded-xl text-lg font-bold shadow-sm transition-all ${emp.overtime > 0 ? 'bg-amber-500 text-white border border-amber-600' : 'bg-slate-100 text-slate-300 border border-slate-200'}`}>{emp.overtime > 0 ? `+ ${emp.overtime} H` : '0 H'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-10 text-right pr-10 bg-slate-50/50 rounded-r-[2.5rem] border-y border-r border-slate-100">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-black text-slate-400 uppercase mb-2">Total Reward</span>
                          <div className={`text-5xl font-mono font-black tracking-tighter ${emp.overtimePay > 0 ? 'text-slate-900' : 'text-slate-300'}`}>$ {emp.overtimePay.toLocaleString()}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {/* --- 系統設定 (完整管理功能回歸) --- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500 text-left">
            <div className="space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3"><Palette className={theme.accentText} size={28}/> 佈景主題視覺切換</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {Object.entries(THEMES).map(([id, t]) => (
                    <button key={id} onClick={() => setThemeId(id)} className={`relative p-6 rounded-[2.5rem] border-4 transition-all duration-300 flex flex-col items-start gap-4 ${themeId === id ? 'border-slate-800 bg-white shadow-xl scale-105' : 'border-white bg-slate-50 opacity-70 hover:opacity-100'}`}>
                      <div className="flex gap-2">
                        <div className={`w-10 h-10 rounded-full ${t.accent} shadow-inner`}></div>
                        <div className={`w-10 h-10 rounded-full ${t.colors[1]} opacity-60`}></div>
                      </div>
                      <span className="text-xl font-black text-slate-800 leading-tight">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 班別管理 - 恢復刪除與 Emoji 庫 */}
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3"><Clock className="text-orange-500" size={32}/> 班別時數動態設定</h3>
                <div className="flex flex-col gap-8 mb-8 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-slate-500">班別名稱</label>
                        <input type="text" value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} placeholder="如:全班" className="bg-white px-6 py-5 rounded-2xl font-bold text-xl" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-slate-500">Emoji 圖示</label>
                        <input type="text" value={newShift.emoji} onChange={e => setNewShift({...newShift, emoji: e.target.value})} className="bg-white px-6 py-5 rounded-2xl font-black text-3xl text-center" />
                      </div>
                   </div>
                   {/* Emoji 選單 */}
                   <div className="bg-white/50 p-6 rounded-3xl border border-slate-200">
                      <div className="text-xs font-black text-slate-400 uppercase mb-4 text-center">點擊快速選擇圖示</div>
                      <div className="space-y-6">
                        {[
                          { label: '天氣', icons: ['🌞', '🌤️', '⛅', '🌥️', '☁️', '🌙'] },
                          { label: '工作', icons: ['💼', '💻', '📞', '📝', '🔨', '🛠️'] },
                          { label: '狀態', icons: ['🌴', '🏖️', '☕', '🍔', '✨', '🔥'] }
                        ].map((group) => (
                          <div key={group.label} className="flex items-center gap-4">
                            <span className="text-sm font-black text-slate-400 min-w-[45px]">{group.label}</span>
                            <div className="flex flex-wrap gap-2">
                              {group.icons.map(icon => (
                                <button key={icon} onClick={() => setNewShift({...newShift, emoji: icon})} className="w-12 h-12 flex items-center justify-center text-2xl bg-white rounded-2xl shadow-sm hover:scale-110 border border-slate-100 transition-transform">{icon}</button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2"><label className="text-sm font-black text-slate-500">開始時間</label><input type="time" value={newShift.start} onChange={e => setNewShift({...newShift, start: e.target.value})} className="bg-white px-6 py-5 rounded-2xl font-black text-2xl" /></div>
                      <div className="flex flex-col gap-2"><label className="text-sm font-black text-slate-500">結束時間</label><input type="time" value={newShift.end} onChange={e => setNewShift({...newShift, end: e.target.value})} className="bg-white px-6 py-5 rounded-2xl font-black text-2xl" /></div>
                   </div>
                   <button onClick={() => { if(!newShift.name) return; const hrs = calculateHours(newShift.start, newShift.end); setShiftTypes([...shiftTypes, { ...newShift, id: Date.now().toString(), hours: hrs, colorIndex: shiftTypes.length }]); setNewShift({ name: '', emoji: '✨', start: '09:00', end: '18:00' }); }} className={`${theme.navActive} text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all`}>確認新增班別</button>
                </div>
                {/* 班別清單 (恢復刪除按鈕) */}
                <div className="space-y-4">
                  {shiftTypes.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2.5rem] group border border-transparent hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-6">
                        <span className="text-5xl bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center border border-slate-100">{s.emoji}</span>
                        <div>
                          <div className="font-black text-3xl text-slate-700">{s.name}</div>
                          <div className="text-sm font-bold text-slate-400 tracking-widest">{s.start} - {s.end} ({s.hours}小時)</div>
                        </div>
                      </div>
                      <button onClick={() => setShiftTypes(shiftTypes.filter(x => x.id !== s.id))} className="text-slate-200 hover:text-rose-500 p-4 transition-colors"><Trash2 size={32}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3"><Target className="text-indigo-500" size={32}/> 營運計算核心基準</h3>
                <div className="space-y-10">
                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                    <label className="text-2xl font-black text-slate-500 uppercase mb-4 block underline underline-offset-8 decoration-slate-200 font-bold">每月基準時數設定</label>
                    <input type="number" value={settings.baseHours} onChange={e => setSettings({...settings, baseHours: Number(e.target.value)})} className="w-full bg-transparent text-6xl font-black text-slate-800 focus:outline-none" />
                  </div>
                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                    <label className="text-2xl font-black text-slate-500 uppercase mb-4 block underline underline-offset-8 decoration-slate-200 font-bold">優化津貼時薪設定</label>
                    <input type="number" value={settings.overtimeRate} onChange={e => setSettings({...settings, overtimeRate: Number(e.target.value)})} className="w-full bg-transparent text-6xl font-black text-slate-800 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3"><UserPlus className="text-emerald-500" size={32}/> 合作夥伴名錄管理</h3>
                <div className="flex gap-4 mb-8">
                  <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="新夥伴姓名..." className="flex-1 bg-slate-50 px-8 py-6 rounded-3xl text-2xl font-bold focus:outline-none focus:ring-4 ring-slate-100 transition-all" />
                  <button onClick={() => { if(!newEmpName)return; setEmployees([...employees,{id:Date.now().toString(),name:newEmpName,schedule:{}}]);setNewEmpName(''); }} className={`${theme.navActive} text-white px-10 rounded-3xl font-black text-2xl shadow-lg`}>新增</button>
                </div>
                <div className="space-y-4">
                  {employees.map(e => (
                    <div key={e.id} className="flex justify-between items-center p-8 bg-slate-50 rounded-[2.5rem] group border border-transparent hover:border-slate-200 transition-all">
                      <span className="font-black text-3xl text-slate-700">{e.name}</span>
                      <button onClick={() => setEmployees(employees.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><Trash2 size={32}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer - 品牌連結與超大標語 */}
      <footer className="max-w-[1600px] mx-auto mt-20 pt-12 border-t border-slate-200 pb-16 no-print text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-4 text-left">
              <span className={`px-4 py-1 ${theme.navActive} text-white text-xs font-black rounded-lg tracking-widest uppercase`}>核心價值</span>
              <span className="text-lg font-bold text-slate-600 tracking-wide text-left">
                廣告壓克力展示 / 辦公文具用品 ● 精選優質材料，融匠心設計，永續工藝，營造藝術品之美。
              </span>
            </div>
            <a href="https://noah999.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 mt-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">© 2026</span>
              <span className="text-sm font-black text-slate-700 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors decoration-slate-400 underline-offset-8 group-hover:underline">
                NOAHSHOP SYSTEM.
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ALL RIGHTS RESERVED.</span>
            </a>
          </div>
          <a href="https://noah999.com" target="_blank" rel="noopener noreferrer" className={`px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] border-2 border-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-lg no-print`}>
            瀏覽官方網站 →
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;