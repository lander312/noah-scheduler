import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Settings, Calendar, Plus, Trash2, Calculator, X, Clock, Palette,
  ChevronDown, ChevronLeft, ChevronRight, Trophy, Award, Target, Zap, TrendingUp, UserPlus, Sparkles
} from 'lucide-react';

// --- 2026 旗艦級三種高對比配色 ---
const THEMES = {
  morandi: {
    name: '莫蘭迪 (優雅)',
    bg: 'bg-[#F8F7F5]',
    card: 'bg-white',
    accentText: 'text-[#8F9E93]',
    border: 'border-[#F0EBE5]',
    colors: ['bg-[#8F9E93]', 'bg-[#D4A373]', 'bg-[#778DA9]', 'bg-[#BC8F8F]', 'bg-[#A5A5A5]']
  },
  ocean: {
    name: '海洋之聲 (深藍)',
    bg: 'bg-[#F0F4F8]',
    card: 'bg-white',
    accentText: 'text-[#4A90E2]',
    border: 'border-[#E1E8F0]',
    colors: ['bg-[#4A90E2]', 'bg-[#50C878]', 'bg-[#FF7F50]', 'bg-[#9B59B6]', 'bg-[#95A5A6]']
  },
  forest: {
    name: '日落森林 (暖綠)',
    bg: 'bg-[#F4F6F0]',
    card: 'bg-white',
    accentText: 'text-[#6B8E23]',
    border: 'border-[#E8EDDF]',
    colors: ['bg-[#6B8E23]', 'bg-[#CD853F]', 'bg-[#4682B4]', 'bg-[#DB7093]', 'bg-[#7F8C8D]']
  }
};

const App = () => {
  // --- 狀態管理 ---
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

  // --- 時間計算 ---
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const getDateKey = (day) => `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // --- 核心邏輯 (修正 sId 邏輯防止全白) ---
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
    if (!shiftId) {
      alert("請先在上方點選一個班別，再使用一鍵填滿！");
      return;
    }
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
    <div className={`min-h-screen ${theme.bg} text-slate-800 p-4 md:p-10 font-sans transition-colors duration-500`}>
      {/* 2026 Header - 大文字清楚比例 */}
      <header className="max-w-[1600px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-5 mr-auto">
          <div className={`${theme.card} w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center text-4xl border ${theme.border}`}>🗓️</div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800">NOAH <span className="font-light text-slate-400 italic">v2026</span></h1>
            <p className="text-base font-bold text-slate-500 uppercase tracking-widest">智能排班與時數算力中心</p>
          </div>
        </div>

        <nav className={`flex ${theme.card} p-2 rounded-2xl shadow-sm border ${theme.border}`}>
          {['schedule', 'summary', 'settings'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-4 rounded-xl text-lg font-black transition-all ${activeTab === tab ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'schedule' ? '排班面板' : tab === 'summary' ? '時數結算' : '系統設定'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Bento Widgets - 頂部數據放大 */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${theme.card} md:col-span-2 rounded-[2.5rem] p-8 shadow-sm border ${theme.border} flex items-center justify-between`}>
              <div>
                <h3 className="text-slate-400 text-sm font-black uppercase mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" /> 本月榮譽榜
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
              <TrendingUp size={120} className="text-slate-50 opacity-10 absolute right-10 pointer-events-none" />
            </div>
            
            <div className="bg-slate-800 text-white rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-center border border-slate-700">
              <span className="text-xs font-black opacity-50 uppercase mb-2">本月基準工時</span>
              <div className="text-5xl font-black">{settings.baseHours}<span className="text-xl font-light ml-2 opacity-60">Hours</span></div>
            </div>

            <div className={`${theme.card} rounded-[2.5rem] p-8 shadow-sm border ${theme.border} flex flex-col justify-center`}>
              <span className="text-slate-400 text-xs font-black uppercase mb-2">成員總數</span>
              <div className="text-5xl font-black text-slate-800">{employees.length}<span className="text-xl font-light ml-2 text-slate-400">Members</span></div>
            </div>
          </div>
        )}

        {/* 排班面板 - 強化格子清楚度 */}
        {activeTab === 'schedule' && (
          <div className={`${theme.card} rounded-[3rem] shadow-sm border ${theme.border} overflow-hidden`}>
            <div className={`p-8 border-b ${theme.border} flex flex-wrap items-center justify-between gap-8 bg-black/[0.01]`}>
              <div className="flex items-center bg-white rounded-2xl shadow-sm border p-1.5">
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth-2, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronLeft size={24}/></button>
                <div className="px-10 font-black text-2xl text-slate-700">{currentYear} / {String(currentMonth).padStart(2,'0')}</div>
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronRight size={24}/></button>
              </div>

              <div className="flex flex-wrap gap-3 items-center bg-white p-2 rounded-2xl border shadow-inner">
                <div className="px-4 py-1 flex items-center gap-2 border-r border-slate-100">
                  <Sparkles size={18} className={theme.accentText} />
                  <span className="text-xs font-black text-slate-400 uppercase">快速筆刷 :</span>
                </div>
                <button 
                  onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')}
                  className={`px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${quickAssignMode === 'clear' ? 'bg-rose-500 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <Trash2 size={16}/> 橡皮擦
                </button>
                {shiftTypes.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setQuickAssignMode(quickAssignMode === s.id ? null : s.id)}
                    className={`px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${quickAssignMode === s.id ? `${theme.colors[s.colorIndex % 5]} text-white shadow-lg scale-110` : 'bg-white text-slate-500 hover:bg-slate-50 border'}`}
                  >
                    <span className="text-xl">{s.emoji}</span> {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full border-separate border-spacing-0">
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
                    <tr key={emp.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="sticky left-0 z-30 bg-white/95 backdrop-blur-md p-6 border-r border-b shadow-[5px_0_15px_rgba(0,0,0,0.03)]">
                        <div className="flex flex-col gap-3">
                          <div className="font-black text-2xl text-slate-800 tracking-tight">{emp.name}</div>
                          <button 
                            onClick={() => fillMonth(emp.id, quickAssignMode)}
                            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 text-xs font-black text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
                          >
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
                          <td key={day} className="p-0 border-b border-r border-slate-50">
                            <button 
                              onClick={() => quickAssignMode && setSchedule(emp.id, k, quickAssignMode === 'clear' ? null : quickAssignMode)}
                              className={`w-full h-20 flex items-center justify-center text-4xl transition-all ${s ? theme.colors[s.colorIndex % 5] + " text-white shadow-inner" : "hover:bg-black/[0.02] text-slate-100"}`}
                            >
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
        )}

        {/* 結算分頁 - 大字清楚版 */}
        {activeTab === 'summary' && (
          <div className={`${theme.card} rounded-[3rem] p-10 shadow-sm border ${theme.border}`}>
             <h3 className="text-3xl font-black text-slate-800 mb-12 flex items-center gap-4">
               <Calculator size={36} className="text-amber-500" /> {currentMonth} 月榮譽與薪資結算表
             </h3>
             <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-8 pl-6">員工成員</th>
                    <th className="pb-8">本月總工時</th>
                    <th className="pb-8">加班狀況</th>
                    <th className="pb-8 text-right pr-6">加班津貼 (NT$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaderboard.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-10 pl-6"><div className="text-3xl font-black text-slate-800">{emp.name}</div></td>
                      <td className="py-10"><div className="text-3xl font-bold">{emp.totalHours}<span className="text-base ml-1 opacity-40 font-normal">h</span></div></td>
                      <td className="py-10">
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

        {/* 設定分頁 - 包含主題切換 */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className={`${theme.card} rounded-[3rem] p-10 shadow-sm border ${theme.border}`}>
              <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><Palette className={theme.accentText}/> 主題與營運基準</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
                {Object.entries(THEMES).map(([id, t]) => (
                  <button key={id} onClick={() => setThemeId(id)} className={`p-5 rounded-2xl border-2 font-black transition-all ${themeId === id ? 'border-slate-800 bg-slate-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="text-xs">{t.name}</div>
                  </button>
                ))}
              </div>
              <div className="space-y-8">
                <div className="bg-slate-50 p-8 rounded-[2rem] border shadow-inner">
                  <label className="text-xs font-black text-slate-400 uppercase mb-3 block">每月基準工時</label>
                  <input type="number" value={settings.baseHours} onChange={e => setSettings({...settings, baseHours: Number(e.target.value)})} className="w-full bg-transparent text-4xl font-black text-slate-800 focus:outline-none" />
                </div>
                <div className="bg-slate-50 p-8 rounded-[2rem] border shadow-inner">
                  <label className="text-xs font-black text-slate-400 uppercase mb-3 block">加班費率 (時薪)</label>
                  <input type="number" value={settings.overtimeRate} onChange={e => setSettings({...settings, overtimeRate: Number(e.target.value)})} className="w-full bg-transparent text-4xl font-black text-slate-800 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className={`${theme.card} rounded-[3rem] p-10 shadow-sm border ${theme.border}`}>
              <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><UserPlus className="text-emerald-500"/> 員工名錄管理</h3>
              <div className="flex gap-4 mb-10">
                <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="新員工姓名..." className="flex-1 bg-slate-50 p-5 rounded-2xl text-xl font-bold focus:outline-none" />
                <button onClick={() => { if(!newEmpName)return; setEmployees([...employees,{id:Date.now().toString(),name:newEmpName,schedule:{}}]);setNewEmpName(''); }} className="bg-slate-800 text-white px-10 rounded-2xl font-black text-xl hover:shadow-xl active:scale-95 transition-all">新增</button>
              </div>
              <div className="space-y-3">
                {employees.map(e => (
                  <div key={e.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all">
                    <span className="font-black text-2xl text-slate-700">{e.name}</span>
                    <button onClick={() => setEmployees(employees.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={28}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="max-w-[1600px] mx-auto mt-20 pt-10 border-t border-slate-200 flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest">
        <div>© 2026 NOAHSHOP SYSTEM. ALL RIGHTS RESERVED.</div>
      </footer>
    </div>
  );
};

export default App;