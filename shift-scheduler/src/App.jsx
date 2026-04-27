import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Settings, Calendar, Plus, Trash2, Calculator, X, Clock, Palette,
  ChevronDown, ChevronLeft, ChevronRight, Trophy, Award, Target, Zap, TrendingUp, UserPlus, Sparkles
} from 'lucide-react';

// --- 2026 旗艦版：三種高對比質感主題 ---
const THEMES = {
  morandi: {
    name: '莫蘭迪 (優雅)',
    bg: 'bg-[#F8F7F5]',
    card: 'bg-white',
    accent: 'bg-[#8F9E93]',
    accentText: 'text-[#8F9E93]',
    border: 'border-[#F0EBE5]',
    headerBg: 'bg-[#F8F7F5]',
    colors: ['bg-[#8F9E93]', 'bg-[#D4A373]', 'bg-[#778DA9]', 'bg-[#BC8F8F]', 'bg-[#A5A5A5]']
  },
  ocean: {
    name: '海洋之聲 (深藍)',
    bg: 'bg-[#F0F4F8]',
    card: 'bg-white',
    accent: 'bg-[#4A90E2]',
    accentText: 'text-[#4A90E2]',
    border: 'border-[#E1E8F0]',
    headerBg: 'bg-[#F0F4F8]',
    colors: ['bg-[#4A90E2]', 'bg-[#50C878]', 'bg-[#FF7F50]', 'bg-[#9B59B6]', 'bg-[#95A5A6]']
  },
  forest: {
    name: '日落森林 (暖綠)',
    bg: 'bg-[#F4F6F0]',
    card: 'bg-white',
    accent: 'bg-[#6B8E23]',
    accentText: 'text-[#6B8E23]',
    border: 'border-[#E8EDDF]',
    headerBg: 'bg-[#F4F6F0]',
    colors: ['bg-[#6B8E23]', 'bg-[#CD853F]', 'bg-[#4682B4]', 'bg-[#DB7093]', 'bg-[#7F8C8D]']
  }
};

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [themeId, setThemeId] = useState('morandi'); // 主題切換狀態
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
    if (!shiftId && shiftId !== 'clear') {
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
    <div className={`min-h-screen ${theme.bg} text-slate-800 p-4 md:p-8 font-sans transition-colors duration-500`}>
      {/* Header */}
      <header className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className={`${theme.card} w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-3xl border ${theme.border}`}>🗓️</div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">NOAH <span className="font-light text-slate-400 italic">v2026</span></h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">智能排班與時數算力中心</p>
          </div>
        </div>

        <nav className={`flex ${theme.card} p-1.5 rounded-2xl shadow-sm border ${theme.border}`}>
          {['schedule', 'summary', 'settings'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-base font-black transition-all ${activeTab === tab ? 'bg-slate-800 text-white shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'schedule' ? '排班面板' : tab === 'summary' ? '時數結算' : '系統設定'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Bento Widgets (只有排班面板才顯示) */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${theme.card} md:col-span-2 rounded-[2rem] p-6 shadow-sm border ${theme.border} flex items-center justify-between`}>
              <div>
                <h3 className="text-slate-400 text-xs font-black uppercase mb-4 flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" /> 本月榮譽榜 (時數排行)
                </h3>
                <div className="flex gap-8">
                  {leaderboard.slice(0, 3).map((emp, i) => (
                    <div key={emp.id} className="text-center group">
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                      <div className="text-base font-black text-slate-800">{emp.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{emp.totalHours}H累計</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 text-white rounded-[2rem] p-6 shadow-xl flex flex-col justify-center border border-slate-700">
              <span className="text-[10px] font-black opacity-50 uppercase mb-1">目標基準工時</span>
              <div className="text-4xl font-black">{settings.baseHours}<span className="text-base font-light ml-2 opacity-60">Hours</span></div>
            </div>

            <div className={`${theme.card} rounded-[2rem] p-6 shadow-sm border ${theme.border} flex flex-col justify-center`}>
              <span className="text-slate-400 text-[10px] font-black uppercase mb-1">成員總計</span>
              <div className="text-4xl font-black text-slate-800">{employees.length}<span className="text-base font-light ml-2 text-slate-400">Members</span></div>
            </div>
          </div>
        )}

        {/* --- 排班面板主體 --- */}
        {activeTab === 'schedule' && (
          <div className={`${theme.card} rounded-[2.5rem] shadow-sm border ${theme.border} overflow-hidden transition-all duration-500`}>
            {/* Toolbar */}
            <div className={`p-6 border-b ${theme.border} flex flex-wrap items-center justify-between gap-6 bg-black/[0.01]`}>
              <div className="flex items-center bg-white rounded-xl shadow-sm border overflow-hidden">
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth-2, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronLeft size={20}/></button>
                <div className="px-8 font-black text-slate-700 text-lg">{currentYear} / {String(currentMonth).padStart(2,'0')}</div>
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronRight size={20}/></button>
              </div>

              <div className="flex flex-wrap gap-2 items-center bg-white p-1.5 rounded-2xl shadow-inner border">
                <div className="px-3 py-1 flex items-center gap-1.5 border-r border-slate-100 mr-1">
                  <Sparkles size={14} className={theme.accentText} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">快速筆刷 :</span>
                </div>
                <button 
                  onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${quickAssignMode === 'clear' ? 'bg-rose-500 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <Trash2 size={14}/> 橡皮擦
                </button>
                {shiftTypes.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setQuickAssignMode(quickAssignMode === s.id ? null : s.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${quickAssignMode === s.id ? `${theme.colors[s.colorIndex % 5]} text-white shadow-lg scale-[1.05]` : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                  >
                    <span>{s.emoji}</span> {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 表格區塊 */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className={`sticky left-0 top-0 z-40 bg-white/95 backdrop-blur-md p-4 text-[10px] font-black uppercase text-slate-400 border-b border-r ${theme.border} min-w-[150px] text-left`}>成員名冊 (員工管理)</th>
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <th key={i} className={`top-0 z-10 p-3 text-xs font-black border-b ${theme.border} text-slate-400 min-w-[45px] text-center`}>{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((emp) => (
                    <tr key={emp.id} className="group transition-colors hover:bg-slate-50/30">
                      <td className={`sticky left-0 z-30 bg-white/95 backdrop-blur-md p-4 border-r border-b ${theme.border} shadow-[4px_0_10px_rgba(0,0,0,0.02)]`}>
                        <div className="flex flex-col gap-2">
                          {/* 人名設計優化 */}
                          <div className="font-black text-lg text-slate-700 tracking-tight">{emp.name}</div>
                          {/* 閃電按鈕顯性化 */}
                          <button 
                            onClick={() => fillMonth(emp.id, quickAssignMode)}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200 group-hover:border-indigo-200"
                            title="以此班別填滿全月"
                          >
                            <Zap size={12} fill="currentColor"/>
                            <span className="text-[10px] font-black uppercase tracking-tighter">一鍵填滿</span>
                          </button>
                        </div>
                      </td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const k = getDateKey(day);
                        const sId = emp.schedule[k];
                        const s = shiftTypes.find(x => x.id === id);
                        return (
                          <td key={day} className={`p-0 border-b border-r ${theme.border} transition-colors`}>
                            <button 
                              onClick={(e) => {
                                if(quickAssignMode !== null) setSchedule(emp.id, k, quickAssignMode === 'clear' ? null : quickAssignMode);
                              }}
                              className={`w-full h-16 flex items-center justify-center text-3xl transition-all ${s ? theme.colors[s.colorIndex % 5] + " text-white shadow-inner" : "bg-transparent hover:bg-black/[0.02] text-slate-100 font-light"}`}
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
            <div className="p-4 bg-slate-50/50 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest flex items-center justify-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               提示：先點選上方班別，再點擊姓名下方的「一鍵填滿」可快速排班
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            </div>
          </div>
        )}

        {/* --- 時數結算分頁 --- */}
        {activeTab === 'summary' && (
          <div className={`${theme.card} rounded-[2.5rem] p-8 shadow-sm border ${theme.border} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
             <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner border border-amber-100"><Calculator size={24}/></div>
                <h3 className="text-2xl font-black text-slate-800">{currentMonth} 月榮譽與薪資結算表</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="pb-6 pl-4">員工成員</th>
                      <th className="pb-6">本月累計總工時</th>
                      <th className="pb-6 text-indigo-500">超額加班時數</th>
                      <th className="pb-6 text-right pr-4">預估加班津貼 (NT$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leaderboard.map(emp => (
                      <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-6 pl-4">
                          <div className="font-black text-xl text-slate-700">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">STAFF_ID: {emp.id.substring(0,6)}</div>
                        </td>
                        <td className="py-6 font-mono font-bold text-2xl text-slate-800">{emp.totalHours}<span className="text-xs text-slate-400 ml-1 font-sans">h</span></td>
                        <td className="py-6">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${emp.overtime > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {emp.overtime > 0 ? `🔥 加成 + ${emp.overtime} H` : '無超額工時'}
                          </span>
                        </td>
                        <td className="py-6 text-right pr-4 font-mono font-black text-3xl text-slate-900 tracking-tighter">
                          $ {emp.overtimePay.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}

        {/* --- 系統設定分頁 (包含主題切換) --- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 主題與營運設定 */}
            <div className="space-y-6">
              <div className={`${theme.card} rounded-[2.5rem] p-8 shadow-sm border ${theme.border}`}>
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Palette className={theme.accentText} size={24}/> 佈景主題切換</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(THEMES).map(([id, t]) => (
                    <button 
                      key={id} 
                      onClick={() => setThemeId(id)}
                      className={`flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all ${themeId === id ? `border-slate-800 bg-slate-50 shadow-md scale-[1.02]` : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                      <div className="flex gap-1">
                        {t.colors.slice(0, 3).map((c, idx) => (
                          <div key={idx} className={`w-4 h-4 rounded-full ${c}`}></div>
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-600 tracking-tighter">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${theme.card} rounded-[2.5rem] p-8 shadow-sm border ${theme.border}`}>
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Target className="text-indigo-500" size={24}/> 營運計算基準</h3>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">每月基準工時設定 (小時)</label>
                    <input 
                      type="number" 
                      value={settings.baseHours} 
                      onChange={e => setSettings({...settings, baseHours: Number(e.target.value)})}
                      className="w-full bg-transparent text-3xl font-black text-slate-700 focus:outline-none" 
                    />
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">加班費率設定 (時薪/NT$)</label>
                    <input 
                      type="number" 
                      value={settings.overtimeRate} 
                      onChange={e => setSettings({...settings, overtimeRate: Number(e.target.value)})}
                      className="w-full bg-transparent text-3xl font-black text-slate-700 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 人員管理 */}
            <div className={`${theme.card} rounded-[2.5rem] p-8 shadow-sm border ${theme.border}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-100"><UserPlus size={24}/></div>
                <h3 className="text-xl font-black text-slate-800">員工名冊管理</h3>
              </div>
              <div className="flex gap-3 mb-8">
                <input 
                  type="text" 
                  value={newEmpName} 
                  onChange={e => setNewEmpName(e.target.value)} 
                  placeholder="請輸入欲新增的員工姓名..." 
                  className="flex-1 bg-slate-50 px-6 py-5 rounded-2xl font-bold border border-slate-100 focus:outline-none focus:ring-4 ring-slate-200 transition-all text-lg" 
                />
                <button 
                  onClick={() => {
                    if(!newEmpName) return;
                    setEmployees([...employees, { id: Date.now().toString(), name: newEmpName, schedule: {} }]);
                    setNewEmpName('');
                  }}
                  className="bg-slate-800 text-white px-10 rounded-2xl font-black text-lg hover:bg-slate-700 shadow-lg active:scale-95 transition-all"
                >
                  新增
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {employees.map(e => (
                  <div key={e.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200">
                    <span className="font-black text-lg text-slate-600">{e.name}</span>
                    <button 
                      onClick={() => setEmployees(employees.filter(emp => emp.id !== e.id))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={20}/>
                    </button>
                  </div>
                ))}
                {employees.length === 0 && <div className="text-center py-10 text-slate-300 font-bold italic">目前尚無員工資料</div>}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <div>© 2026 NOAHSHOP SYSTEM. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-4">
          <span className="hover:text-slate-600 cursor-help">隱私政策</span>
          <span className="hover:text-slate-600 cursor-help">技術支援</span>
        </div>
      </footer>
    </div>
  );
};

export default App;