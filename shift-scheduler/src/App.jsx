import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Settings, Calendar, Plus, Trash2, Calculator, X, Clock, Palette,
  ChevronDown, ChevronLeft, ChevronRight, Trophy, Award, Target, Zap, TrendingUp, UserPlus
} from 'lucide-react';

// --- 2026 高對比莫蘭迪配色 ---
const THEMES = {
  morandi: {
    bg: 'bg-[#F8F7F5]',
    card: 'bg-white/80 backdrop-blur-md',
    accent: '#8F9E93',
    colors: [
      'bg-[#8F9E93]', // 灰綠 (全班)
      'bg-[#D4A373]', // 橡木褐 (午班)
      'bg-[#778DA9]', // 藍灰 (晚班)
      'bg-[#BC8F8F]', // 玫瑰褐 (特殊)
      'bg-[#A5A5A5]', // 中性灰 (休假)
    ]
  }
};

const App = () => {
  // --- 狀態管理 ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [settings, setSettings] = useState({ baseHours: 176, overtimeRate: 200 });
  const [quickAssignMode, setQuickAssignMode] = useState(null);
  const [newEmpName, setNewEmpName] = useState('');
  
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

  // --- 核心邏輯 ---
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
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const newSchedule = { ...emp.schedule };
        for (let i = 1; i <= daysInMonth; i++) {
          const key = getDateKey(i);
          if (shiftId === null || shiftId === 'clear') delete newSchedule[key];
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
      Object.entries(emp.schedule).forEach(([k, id]) => {
        if (k.startsWith(prefix)) {
          const s = shiftTypes.find(x => x.id === id);
          if (s) totalHours += Number(s.hours);
        }
      });
      const overtime = Math.max(0, totalHours - settings.baseHours);
      return { ...emp, totalHours, overtime, overtimePay: overtime * settings.overtimeRate };
    });
  }, [employees, shiftTypes, settings, currentYear, currentMonth]);

  const leaderboard = useMemo(() => [...stats].sort((a, b) => b.totalHours - a.totalHours), [stats]);

  return (
    <div className={`min-h-screen ${THEMES.morandi.bg} text-slate-700 p-3 md:p-8 font-sans selection:bg-slate-200`}>
      {/* 2026 Header */}
      <header className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl">🗓️</div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">NOAH<span className="font-light opacity-50 text-lg ml-1">Scheduler v2026</span></h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">智能排班與時數算力中心</p>
          </div>
        </div>

        <nav className="flex bg-white/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-sm">
          {['schedule', 'summary', 'settings'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'schedule' ? '排班面板' : tab === 'summary' ? '時數結算' : '系統設定'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-6">
        
        {/* TOP WIDGETS: 榮譽榜移至上方 */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-slate-400 text-xs font-black uppercase mb-4 flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" /> 本月榮譽榜
                </h3>
                <div className="flex gap-6">
                  {leaderboard.slice(0, 3).map((emp, i) => (
                    <div key={emp.id} className="text-center">
                      <div className="text-2xl mb-1">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                      <div className="text-sm font-black text-slate-800">{emp.name}</div>
                      <div className="text-[10px] font-bold text-slate-400">{emp.totalHours}H</div>
                    </div>
                  ))}
                </div>
              </div>
              <TrendingUp size={120} className="absolute -right-4 -bottom-4 text-slate-50 opacity-[0.05]" />
            </div>
            
            <div className="bg-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-center">
              <span className="text-[10px] font-black opacity-50 uppercase mb-1">本月基準工時</span>
              <div className="text-3xl font-black">{settings.baseHours}<span className="text-sm font-light ml-1 opacity-60">Hours</span></div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
              <span className="text-slate-400 text-[10px] font-black uppercase mb-1">人員總數</span>
              <div className="text-3xl font-black text-slate-800">{employees.length}<span className="text-sm font-light ml-1 text-slate-400">Members</span></div>
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT --- */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6 bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth-2, 1))} className="p-2.5 hover:bg-slate-50 border-r text-slate-400"><ChevronLeft size={20}/></button>
                  <div className="px-6 font-black text-slate-700 min-w-[120px] text-center">{currentYear} / {String(currentMonth).padStart(2,'0')}</div>
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth, 1))} className="p-2.5 hover:bg-slate-50 border-l text-slate-400"><ChevronRight size={20}/></button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center bg-white/80 p-1.5 rounded-2xl shadow-inner border">
                <span className="text-[10px] font-black text-slate-300 px-2 uppercase">快速塗抹工具:</span>
                <button 
                  onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${quickAssignMode === 'clear' ? 'bg-rose-500 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <Trash2 size={14}/> 橡皮擦
                </button>
                {shiftTypes.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setQuickAssignMode(quickAssignMode === s.id ? null : s.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${quickAssignMode === s.id ? `${THEMES.morandi.colors[s.colorIndex % 5]} text-white shadow-lg` : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                  >
                    <span>{s.emoji}</span> {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduler Table */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="sticky left-0 top-0 z-40 bg-white/95 backdrop-blur-md p-4 text-[10px] font-black uppercase text-slate-400 border-b border-r border-slate-100 min-w-[120px] text-left">員工姓名 (⚡一鍵填滿)</th>
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <th key={i} className="top-0 z-10 p-3 text-[10px] font-black border-b border-slate-100 text-slate-400 min-w-[40px] text-center">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((emp) => (
                    <tr key={emp.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="sticky left-0 z-30 bg-white/95 backdrop-blur-md p-4 border-r border-b border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between items-center group/name">
                          <span className="font-bold text-slate-700">{emp.name}</span>
                          <button 
                            onClick={() => fillMonth(emp.id, quickAssignMode)}
                            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 hover:bg-indigo-50 hover:text-indigo-500 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                            title="以此班別填滿全月"
                          >
                            <Zap size={14} fill="currentColor"/>
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
                              onClick={(e) => {
                                e.preventDefault();
                                if(quickAssignMode !== null) setSchedule(emp.id, k, quickAssignMode === 'clear' ? null : quickAssignMode);
                              }}
                              className={`w-full h-12 flex items-center justify-center text-xl transition-all ${s ? THEMES.morandi.colors[s.colorIndex % 5] + " text-white shadow-inner" : "bg-transparent hover:bg-slate-100/50 text-transparent"}`}
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
            <div className="p-4 bg-slate-50 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest italic">
              Tip: 滑動表格時姓名欄位會自動凍結，方便對照日期
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB: 完整回歸 --- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500"><Target size={20}/></div>
                <h3 className="text-xl font-black text-slate-800">營運基準設定</h3>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">每月基準工時 (小時)</label>
                  <input 
                    type="number" 
                    value={settings.baseHours} 
                    onChange={e => setSettings({...settings, baseHours: Number(e.target.value)})}
                    className="w-full bg-transparent text-2xl font-black text-slate-700 focus:outline-none" 
                  />
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">加班費率 (時薪/NT$)</label>
                  <input 
                    type="number" 
                    value={settings.overtimeRate} 
                    onChange={e => setSettings({...settings, overtimeRate: Number(e.target.value)})}
                    className="w-full bg-transparent text-2xl font-black text-slate-700 focus:outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500"><UserPlus size={20}/></div>
                <h3 className="text-xl font-black text-slate-800">人員名單管理</h3>
              </div>
              <div className="flex gap-3 mb-6">
                <input 
                  type="text" 
                  value={newEmpName} 
                  onChange={e => setNewEmpName(e.target.value)} 
                  placeholder="輸入員工姓名..." 
                  className="flex-1 bg-slate-50 px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-2 ring-slate-200" 
                />
                <button 
                  onClick={() => {
                    if(!newEmpName) return;
                    setEmployees([...employees, { id: Date.now().toString(), name: newEmpName, schedule: {} }]);
                    setNewEmpName('');
                  }}
                  className="bg-slate-800 text-white px-8 rounded-2xl font-black hover:bg-slate-700 shadow-lg shadow-slate-200"
                >
                  新增
                </button>
              </div>
              <div className="space-y-3">
                {employees.map(e => (
                  <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100">
                    <span className="font-bold text-slate-600">{e.name}</span>
                    <button 
                      onClick={() => setEmployees(employees.filter(emp => emp.id !== e.id))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- SUMMARY TAB: 結算表 --- */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><Calculator size={20}/></div>
                  <h3 className="text-2xl font-black text-slate-800">{currentMonth} 月榮譽結算中心</h3>
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="pb-6">員工成員</th>
                      <th className="pb-6">本月累計時數</th>
                      <th className="pb-6 text-indigo-500">加班時數</th>
                      <th className="pb-6 text-right">預算結餘 (NT$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leaderboard.map(emp => (
                      <tr key={emp.id} className="group">
                        <td className="py-6">
                          <div className="font-black text-slate-700">{emp.name}</div>
                          <div className="text-[10px] text-slate-400">Employee ID: {emp.id.substring(0,6)}</div>
                        </td>
                        <td className="py-6 font-mono font-bold text-lg">{emp.totalHours}<span className="text-xs text-slate-400 ml-1">h</span></td>
                        <td className="py-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${emp.overtime > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            {emp.overtime > 0 ? `+ ${emp.overtime} H` : '無加班'}
                          </span>
                        </td>
                        <td className="py-6 text-right font-mono font-black text-xl text-slate-800">
                          $ {emp.overtimePay.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;