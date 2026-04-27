import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Settings, Calendar, Plus, Trash2, Calculator, Clock, Palette,
  ChevronLeft, ChevronRight, Trophy, Target, Zap, UserPlus, Sparkles, Printer, FileSpreadsheet, Send
} from 'lucide-react';

// --- 全局主題定義 ---
const THEMES = {
  morandi: {
    name: '莫蘭迪 (優雅)', bg: 'bg-[#F8F7F5]', card: 'bg-white', accent: 'bg-[#8F9E93]', accentText: 'text-[#8F9E93]', border: 'border-[#F0EBE5]', navActive: 'bg-slate-800',
    colors: ['bg-[#8F9E93]', 'bg-[#D4A373]', 'bg-[#778DA9]', 'bg-[#BC8F8F]', 'bg-[#A5A5A5]']
  },
  sunset: {
    name: '落日 (暖橙)', bg: 'bg-[#FFF8F5]', card: 'bg-white', accent: 'bg-[#FF6B4A]', accentText: 'text-[#FF6B4A]', border: 'border-[#FFE4D9]', navActive: 'bg-[#E64A19]',
    colors: ['bg-[#FF6B4A]', 'bg-[#FFB347]', 'bg-[#D35400]', 'bg-[#FFCCBC]', 'bg-[#795548]']
  },
  ocean: {
    name: '海洋 (深藍)', bg: 'bg-[#EBF1F6]', card: 'bg-white', accent: 'bg-[#4A90E2]', accentText: 'text-[#4A90E2]', border: 'border-[#D1E0ED]', navActive: 'bg-[#2C3E50]',
    colors: ['bg-[#4A90E2]', 'bg-[#50C878]', 'bg-[#FF7F50]', 'bg-[#9B59B6]', 'bg-[#95A5A6]']
  }
};

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [themeId, setThemeId] = useState('morandi');
  const [settings, setSettings] = useState({ baseHours: 176, overtimeRate: 200 });
  const [quickAssignMode, setQuickAssignMode] = useState(null);
  const [batchDates, setBatchDates] = useState('');
  const [selectedEmpForBatch, setSelectedEmpForBatch] = useState(null);
  const [newEmpName, setNewEmpName] = useState('');
  
  const theme = THEMES[themeId];

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

  // --- 批量日期處理邏輯 ---
  const handleBatchAssign = () => {
    if (!selectedEmpForBatch || !quickAssignMode || !batchDates) {
      alert("請先：1.點選人員姓名 2.選擇班別 3.輸入日期數字");
      return;
    }
    const days = batchDates.split(/[,， ]+/).map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 1 && d <= daysInMonth);
    
    setEmployees(prev => prev.map(emp => {
      if (emp.id === selectedEmpForBatch) {
        const newSchedule = { ...emp.schedule };
        days.forEach(day => {
          const key = getDateKey(day);
          if (quickAssignMode === 'clear') delete newSchedule[key];
          else newSchedule[key] = quickAssignMode;
        });
        return { ...emp, schedule: newSchedule };
      }
      return emp;
    }));
    setBatchDates('');
  };

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

  // --- CSV 轉存功能 ---
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "合作夥伴," + Array.from({length: daysInMonth}, (_, i) => i + 1).join(",") + ",總時數\n";
    
    employees.forEach(emp => {
      let row = [emp.name];
      let total = 0;
      for(let i=1; i<=daysInMonth; i++) {
        const sId = emp.schedule[getDateKey(i)];
        const s = shiftTypes.find(x => x.id === sId);
        row.push(s ? s.name : "");
        if(s) total += s.hours;
      }
      row.push(total);
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NoahShop_Schedule_${currentYear}_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
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
    <div className={`min-h-screen ${theme.bg} text-slate-800 p-4 md:p-6 transition-colors duration-700 font-sans`}>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0.5cm; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #ddd !important; border-radius: 0 !important; width: 100% !important; margin: 0 !important; padding: 10px !important; }
          .print-table { width: 100% !important; border-collapse: collapse !important; }
          .print-table td, .print-table th { border: 1px solid #999 !important; font-size: 9px !important; padding: 2px !important; }
          .print-name { font-size: 12px !important; font-weight: bold !important; width: 80px !important; }
          .emoji-print { font-size: 14px !important; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header - 專業化品牌優化 */}
      <header className="max-w-[1600px] mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center gap-4 mr-auto">
          <div className={`bg-white w-12 h-12 rounded-xl shadow-lg flex items-center justify-center text-2xl border ${theme.border}`}>🗓️</div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-0.5">專業雲端營運管理系統</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">NOAH <span className="font-light text-slate-400 italic">v2026</span></h1>
          </div>
        </div>
        <nav className={`flex bg-white p-1.5 rounded-2xl shadow-sm border ${theme.border}`}>
          {['schedule', 'summary', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-base font-black transition-all ${activeTab === tab ? `${theme.navActive} text-white shadow-md scale-105` : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'schedule' ? '排班面板' : tab === 'summary' ? '結算中心' : '系統設定'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-4">
        {activeTab === 'schedule' && (
          <>
            {/* 批量操作工具列 */}
            <div className="bg-slate-800 text-white rounded-[2rem] p-5 shadow-xl flex flex-wrap items-center justify-between gap-6 no-print">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">第一步：選定人員</span>
                  <div className="text-lg font-black text-white">{selectedEmpForBatch ? employees.find(e => e.id === selectedEmpForBatch).name : '請點選下方人名'}</div>
                </div>
                <div className="h-8 w-px bg-slate-700 mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">第二步：批量日期 (例: 1,3,5 或 10-15)</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={batchDates} 
                      onChange={e => setBatchDates(e.target.value)}
                      placeholder="輸入日期數字..." 
                      className="bg-slate-900 border border-slate-700 px-4 py-1.5 rounded-lg text-white font-bold focus:outline-none focus:ring-2 ring-indigo-500 w-64"
                    />
                    <button 
                      onClick={handleBatchAssign}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-black flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Send size={14}/> 注入排班
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-black flex items-center gap-2 text-sm transition-all"><FileSpreadsheet size={16}/> 轉存試算表</button>
                <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl font-black flex items-center gap-2 text-sm border border-white/20 transition-all"><Printer size={16}/> 列印報表</button>
              </div>
            </div>

{/* --- 排班面板 (專業數據版：移除失敗大圓角，強化直覺反饋) --- */}
            <div className={`bg-white rounded-3xl shadow-sm border ${theme.border} overflow-hidden print-card`}>
              {/* 工具列 no-print */}
              <div className="p-5 border-b flex flex-wrap items-center justify-between gap-6 bg-black/[0.01] no-print">
                <div className="flex items-center bg-white rounded-xl shadow-sm border p-1">
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth-2, 1))} className="p-2 hover:bg-slate-50 text-slate-400"><ChevronLeft size={20}/></button>
                  <div className="px-6 font-black text-xl text-slate-700">{currentYear} / {String(currentMonth).padStart(2,'0')}</div>
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth, 1))} className="p-3 hover:bg-slate-50 text-slate-400"><ChevronRight size={20}/></button>
                </div>

                <div className="flex flex-wrap gap-2 items-center bg-white p-1.5 rounded-2xl border shadow-inner">
                  <div className="px-3 flex items-center gap-1.5 border-r border-slate-100">
                    <Sparkles size={16} className={theme.accentText} />
                    <span className="text-[10px] font-black text-slate-400 uppercase">快速筆刷 :</span>
                  </div>
                  {shiftTypes.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => setQuickAssignMode(quickAssignMode === s.id ? null : s.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${quickAssignMode === s.id ? `${theme.colors[s.colorIndex % 5]} text-white shadow-lg scale-105` : 'hover:bg-slate-50 text-slate-500 border border-transparent hover:border-slate-200'}`}
                    >
                      <span className="text-xl">{s.emoji}</span> {s.name}
                    </button>
                  ))}
                  <button onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')} className={`px-4 py-2 rounded-xl text-xs font-black ${quickAssignMode === 'clear' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-300 hover:bg-rose-50'}`}><Trash2 size={18}/></button>
                </div>
              </div>

              {/* 表格主體 */}
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full border-separate border-spacing-0 text-left print-table">
                  <thead>
                    <tr className="bg-slate-50/50">
                      {/* 人名欄位縮小，移除多餘裝飾 */}
                      <th className="sticky left-0 top-0 z-40 bg-white p-4 text-[10px] font-black uppercase text-slate-400 border-b border-r min-w-[120px] text-left print-name">成員名冊 (⚡填滿)</th>
                      {Array.from({ length: daysInMonth }).map((_, i) => (
                        <th key={i} className="top-0 p-2 text-[10px] font-black border-b text-center min-w-[38px] text-slate-400">{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((emp) => (
                      <tr 
                        key={emp.id} 
                        className={`group transition-colors ${selectedEmpForBatch === emp.id ? 'bg-black/[0.02]' : 'hover:bg-slate-50/30'}`}
                      >
                        {/* 專業人名名片：移除大圓角，採用左側條反饋 */}
                        <td 
                          className={`sticky left-0 z-30 bg-white p-4 border-r border-b shadow-[4px_0_10px_rgba(0,0,0,0.02)] print-name cursor-pointer relative ${selectedEmpForBatch === emp.id ? 'bg-slate-50' : ''}`} 
                          onClick={() => setSelectedEmpForBatch(emp.id)}
                        >
                          {/* 選中時的左側強調色條 - 不佔空間，直覺貼心 */}
                          {selectedEmpForBatch === emp.id && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent} rounded-r`}></div>
                          )}
                          
                          <div className="flex flex-col gap-1 pl-2 text-left">
                            <div className={`font-black text-2xl tracking-tight text-left transition-colors ${selectedEmpForBatch === emp.id ? theme.accentText : 'text-slate-700'}`}>
                              {emp.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-left no-print">
                              <span className="text-[9px] font-bold text-slate-400 uppercase px-1.5 py-0.5 bg-slate-100 rounded">ID:{emp.id.slice(-3)}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); fillMonth(emp.id, quickAssignMode); }} 
                                className={`text-[10px] font-black transition-colors ${selectedEmpForBatch === emp.id ? theme.accentText : 'text-indigo-500 hover:text-indigo-600'}`}
                              >
                                ⚡填滿
                              </button>
                            </div>
                          </div>
                        </td>
                        
                        {/* 排班格 - 上圖下文粗體 (維持原樣，縮排間距) */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const k = getDateKey(day);
                          const sId = emp.schedule[k];
                          const s = shiftTypes.find(x => x.id === sId);
                          return (
                            <td key={day} className="p-0 border-b border-r border-slate-50 transition-colors">
                              <button 
                                onClick={() => quickAssignMode && setSchedule(emp.id, k, quickAssignMode === 'clear' ? null : quickAssignMode)}
                                className={`w-full h-14 flex flex-col items-center justify-center gap-0 transition-all ${s ? theme.colors[s.colorIndex % 5] + " text-white shadow-inner" : "bg-transparent hover:bg-black/[0.02] text-slate-100"}`}
                              >
                                {s ? (
                                  <>
                                    <span className="text-xl leading-none emoji-print">{s.emoji}</span>
                                    {/* 下方中文加粗，文字稍微縮小保持格子精緻 */}
                                    <span className="text-[9px] font-bold uppercase leading-tight font-black">{s.name}</span>
                                  </>
                                ) : '·'}
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

        {/* --- 結算中心 (文字放大且間距緊湊) --- */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 text-left">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                 <Calculator size={36} className="text-amber-500" /> {currentMonth} 月營運績效酬勞結算
               </h3>
               <button onClick={exportToCSV} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 text-sm"><FileSpreadsheet size={16}/> 匯出報表</button>
             </div>
             <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] opacity-80">
                    <th className="pb-2 pl-10">合作夥伴</th>
                    <th className="pb-2">總時數</th>
                    <th className="pb-2">時數組成</th>
                    <th className="pb-2 text-right pr-10">預估津貼 (NT$)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(emp => (
                    <tr key={emp.id} className="group hover:translate-x-1 transition-all">
                      <td className="py-5 pl-10 bg-slate-50/50 rounded-l-[2rem] border-y border-l border-slate-100">
                        <div className="text-2xl font-black text-slate-800">{emp.name}</div>
                      </td>
                      <td className="py-5 bg-slate-50/50 border-y border-slate-100">
                        <div className="text-2xl font-bold font-mono">{emp.totalHours}<span className="text-sm ml-1 text-slate-400 font-sans">H</span></div>
                      </td>
                      <td className="py-5 bg-slate-50/50 border-y border-slate-100">
                        <div className="flex items-center gap-3 text-xs font-bold">
                           <span className="px-3 py-1 bg-white border rounded-lg text-slate-500">基礎: {Math.min(emp.totalHours, settings.baseHours)}H</span>
                           <span className={`px-3 py-1 rounded-lg ${emp.overtime > 0 ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-300'}`}>增值: +{emp.overtime}H</span>
                        </div>
                      </td>
                      <td className="py-5 text-right pr-10 bg-slate-50/50 rounded-r-[2rem] border-y border-r border-slate-100 font-black text-3xl text-slate-900">
                        $ {emp.overtimePay.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {/* --- 系統設定 (完整功能) --- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3"><Palette className={theme.accentText} size={24}/> 主題視覺切換</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(THEMES).map(([id, t]) => (
                    <button key={id} onClick={() => setThemeId(id)} className={`relative p-4 rounded-2xl border-4 transition-all ${themeId === id ? 'border-slate-800 bg-white shadow-lg scale-105' : 'border-slate-50 opacity-60'}`}>
                      <div className="flex gap-1 mb-2">
                        <div className={`w-6 h-6 rounded-full ${t.accent}`}></div>
                        <div className={`w-6 h-6 rounded-full ${t.colors[1]}`}></div>
                      </div>
                      <span className="text-sm font-black text-slate-800">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3"><Clock className="text-orange-500" size={24}/> 班別時數動態設定</h3>
                <div className="flex flex-col gap-4 mb-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                   <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} placeholder="班別名稱" className="bg-white px-4 py-3 rounded-xl font-bold" />
                      <input type="text" value={newShift.emoji} onChange={e => setNewShift({...newShift, emoji: e.target.value})} className="bg-white px-4 py-3 rounded-xl font-black text-xl text-center" />
                   </div>
                   {/* Emoji 選單預覽 */}
                   <div className="flex flex-wrap gap-2 bg-white/50 p-3 rounded-xl border border-slate-200">
                      {['🌞', '🌤️', '🌙', '🌴', '💼', '💻', '🔨', '✨', '🔥'].map(icon => (
                        <button key={icon} onClick={() => setNewShift({...newShift, emoji: icon})} className="w-10 h-10 flex items-center justify-center text-xl bg-white rounded-lg hover:scale-110 shadow-sm border border-slate-100">{icon}</button>
                      ))}
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <input type="time" value={newShift.start} onChange={e => setNewShift({...newShift, start: e.target.value})} className="bg-white px-4 py-3 rounded-xl font-black" />
                      <input type="time" value={newShift.end} onChange={e => setNewShift({...newShift, end: e.target.value})} className="bg-white px-4 py-3 rounded-xl font-black" />
                   </div>
                   <button onClick={() => { if(!newShift.name) return; const hrs = calculateHours(newShift.start, newShift.end); setShiftTypes([...shiftTypes, { ...newShift, id: Date.now().toString(), hours: hrs, colorIndex: shiftTypes.length }]); setNewShift({ name: '', emoji: '✨', start: '09:00', end: '18:00' }); }} className={`${theme.navActive} text-white py-4 rounded-xl font-black shadow-lg`}>確認新增</button>
                </div>
                <div className="space-y-2">
                  {shiftTypes.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl bg-white w-12 h-12 rounded-xl shadow-sm flex items-center justify-center border border-slate-100">{s.emoji}</span>
                        <div><div className="font-black text-slate-700">{s.name}</div><div className="text-[10px] font-bold text-slate-400">{s.start}-{s.end} ({s.hours}H)</div></div>
                      </div>
                      <button onClick={() => setShiftTypes(shiftTypes.filter(x => x.id !== s.id))} className="text-slate-200 hover:text-rose-500 p-3 transition-colors"><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3"><Target className="text-indigo-500" size={24}/> 營運核心基準</h3>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                    <label className="text-sm font-black text-slate-500 uppercase mb-3 block">每月基準時數設定</label>
                    <input type="number" value={settings.baseHours} onChange={e => setSettings({...settings, baseHours: Number(e.target.value)})} className="w-full bg-transparent text-4xl font-black text-slate-800 focus:outline-none" />
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                    <label className="text-sm font-black text-slate-500 uppercase mb-3 block">增值酬勞費率 (時薪)</label>
                    <input type="number" value={settings.overtimeRate} onChange={e => setSettings({...settings, overtimeRate: Number(e.target.value)})} className="w-full bg-transparent text-4xl font-black text-slate-800 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3"><UserPlus className="text-emerald-500" size={24}/> 合作夥伴名錄管理</h3>
                <div className="flex gap-3 mb-6">
                  <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="新夥伴姓名" className="flex-1 bg-slate-50 px-6 py-4 rounded-2xl font-bold text-lg" />
                  <button onClick={() => { if(!newEmpName)return; setEmployees([...employees,{id:Date.now().toString(),name:newEmpName,schedule:{}}]);setNewEmpName(''); }} className={`${theme.navActive} text-white px-8 rounded-2xl font-black text-lg shadow-lg`}>新增</button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {employees.map(e => (
                    <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                      <span className="font-black text-xl text-slate-700">{e.name}</span>
                      <button onClick={() => setEmployees(employees.filter(x => x.id !== e.id))} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={24}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer - 品牌加強版 */}
      <footer className="max-w-[1600px] mx-auto mt-12 pt-10 border-t border-slate-200 pb-12 no-print text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 ${theme.navActive} text-white text-xs font-black rounded-lg tracking-widest uppercase`}>核心價值</span>
              <span className="text-base font-bold text-slate-600 tracking-wide text-left">廣告壓克力展示 / 辦公文具用品 ● 精選優質材料，融匠心設計，永續工藝，營造藝術品之美。</span>
            </div>
            <a href="https://noah999.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 mt-2">
              <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">© 2026</span>
              <span className="text-sm font-black text-slate-700 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors decoration-slate-400 underline-offset-8 group-hover:underline">NOAHSHOP SYSTEM.</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ALL RIGHTS RESERVED.</span>
            </a>
          </div>
          <a href="https://noah999.com" target="_blank" rel="noopener noreferrer" className={`px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] border-2 border-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-lg`}>瀏覽官方網站 →</a>
        </div>
      </footer>
    </div>
  );
};

export default App;