import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Settings, Calendar, Plus, Trash2, Calculator, X, Clock, Palette,
  ChevronDown, ChevronLeft, ChevronRight, Trophy, Award, Target, Zap
} from 'lucide-react';

// --- 優化版：高辨識度莫蘭迪配色 ---
const THEMES = {
  morandi: {
    name: '莫蘭迪 (高辨識度)',
    bg: 'bg-[#F4F1ED]',
    cardBg: 'bg-white',
    text: 'text-[#4A4E4D]',
    textMuted: 'text-[#8A8F8E]',
    border: 'border-[#F0EBE5]',
    primary: 'bg-[#8F9E93]',
    primaryText: 'text-[#8F9E93]',
    gradient: 'from-[#8F9E93] to-[#7B8B80]',
    // 重新定義 5 種高對比色 (暖/冷/灰/深/亮)
    colors: [
      'bg-[#8F9E93]', // 灰綠 (全班)
      'bg-[#D4A373]', // 橡木褐 (午班 - 暖色對比)
      'bg-[#A5A5A5]', // 中性灰 (休假)
      'bg-[#778DA9]', // 藍灰 (晚班 - 冷色對比)
      'bg-[#E07A5F]'  // 磚紅 (特殊班)
    ]
  }
};

const COMMON_EMOJIS = ['🌞','🌤️','⛅','🌥️','☁️','🌧️','🌙','⭐','🌴','🏖️','🏠','🏢','🏥','☕','🍔','💤','🏃','💼','🎯','🎉','✨','🔥'];

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const [themeId, setThemeId] = useState('morandi');
  const theme = THEMES[themeId];

  const [settings, setSettings] = useState({ baseHours: 176, overtimeRate: 200 });
  const [shiftTypes, setShiftTypes] = useState([
    { id: '1', name: '全班', emoji: '🌞', hours: 8, colorIndex: 0 },
    { id: '2', name: '午班', emoji: '🌤️', hours: 4, colorIndex: 1 },
    { id: '3', name: '休假', emoji: '🌴', hours: 0, colorIndex: 2 },
  ]);

  const [employees, setEmployees] = useState([
    { id: '1', name: '陳小明', schedule: {} },
    { id: '2', name: '林小華', schedule: {} },
  ]);

  const [activeTab, setActiveTab] = useState('schedule');
  const [quickAssignMode, setQuickAssignMode] = useState(null);
  const [newEmpName, setNewEmpName] = useState('');
  const [newShift, setNewShift] = useState({ name: '', emoji: '✨', hours: 8 });

  const getDateKey = (day) => `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const getMonthPrefix = () => `${currentYear}-${String(currentMonth).padStart(2, '0')}-`;

  // 優化點擊效能，防止捲軸跳動
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

  // 一鍵填滿功能 (解決重複點擊困擾)
  const fillMonth = (empId, shiftId) => {
    if(!shiftId && shiftId !== null) return;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const newSchedule = { ...emp.schedule };
        for (let i = 1; i <= daysInMonth; i++) {
          const key = getDateKey(i);
          if (shiftId === null) delete newSchedule[key];
          else newSchedule[key] = shiftId;
        }
        return { ...emp, schedule: newSchedule };
      }
      return emp;
    }));
  };

  const stats = useMemo(() => {
    const prefix = getMonthPrefix();
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
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-2 md:p-6 transition-none`}>
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className={theme.primaryText} /> Noah 智能排班系統
        </h1>
        <div className={`flex bg-white rounded-xl shadow-sm p-1 border ${theme.border}`}>
          {['schedule', 'summary', 'settings'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === t ? `${theme.primary} text-white` : 'text-gray-400'}`}>
              {t === 'schedule' ? '排班表' : t === 'summary' ? '結算' : '設定'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border">
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth-2, 1))}><ChevronLeft size={18}/></button>
                <span className="font-bold w-24 text-center">{currentYear}/{currentMonth}</span>
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth, 1))}><ChevronRight size={18}/></button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${quickAssignMode === 'clear' ? 'bg-red-500 text-white' : 'bg-white'}`}>橡皮擦</button>
                {shiftTypes.map(s => (
                  <button key={s.id} onClick={() => setQuickAssignMode(quickAssignMode === s.id ? null : s.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${quickAssignMode === s.id ? `${theme.colors[s.colorIndex % 5]} text-white` : 'bg-white'}`}>
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 表格區塊：強化固定與防跳動 */}
            <div className="overflow-x-auto" style={{ overscrollBehaviorX: 'none' }}>
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="sticky left-0 top-0 z-40 bg-[#F9FAFB] p-3 text-xs font-bold border-b border-r text-gray-500 min-w-[100px]">姓名 (點擊填滿)</th>
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <th key={i} className="top-0 z-10 bg-[#F9FAFB] p-2 text-xs font-bold border-b text-gray-400 min-w-[35px]">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((emp) => (
                    <tr key={emp.id}>
                      <td className="sticky left-0 z-30 bg-white p-2 border-r border-b font-medium text-sm shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center">
                          {emp.name}
                          <button 
                            onClick={() => fillMonth(emp.id, quickAssignMode === 'clear' ? null : quickAssignMode)}
                            className="p-1 hover:bg-gray-100 rounded text-[10px] text-blue-500"
                            title="以此班別填滿全月"
                          >
                            <Zap size={12}/>
                          </button>
                        </div>
                      </td>
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const k = getDateKey(day);
                        const sId = emp.schedule[k];
                        const s = shiftTypes.find(x => x.id === sId);
                        return (
                          <td key={day} className="p-0 border-b border-r border-gray-50">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                if(quickAssignMode !== null) setSchedule(emp.id, k, quickAssignMode === 'clear' ? null : quickAssignMode);
                              }}
                              className={`w-full h-10 flex items-center justify-center text-lg ${s ? theme.colors[s.colorIndex % 5] + " text-white" : "hover:bg-gray-100"}`}
                            >
                              {s?.emoji}
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

          {/* 側邊榮譽榜 */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Trophy size={18} className="text-yellow-500"/> 榮譽榜</h3>
              {leaderboard.slice(0, 3).map((emp, i) => (
                <div key={emp.id} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {emp.name}</span>
                    <span className="font-bold">{emp.totalHours}h</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`${theme.primary} h-full`} style={{ width: `${Math.min(100, (emp.totalHours/settings.baseHours)*100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="bg-white rounded-2xl border p-6">
           <h2 className="text-xl font-bold mb-6">時數結算 ({currentMonth}月)</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-emerald-600 text-sm">基準工時</div>
                <div className="text-2xl font-bold">{settings.baseHours}h</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-blue-600 text-sm">加班費率</div>
                <div className="text-2xl font-bold">${settings.overtimeRate}/h</div>
              </div>
           </div>
           <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-gray-400">
                  <th className="pb-3">姓名</th>
                  <th className="pb-3">總時數</th>
                  <th className="pb-3">加班時數</th>
                  <th className="pb-3 text-right">加班費</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(emp => (
                  <tr key={emp.id} className="border-b last:border-0">
                    <td className="py-4 font-bold">{emp.name}</td>
                    <td className="py-4">{emp.totalHours}h</td>
                    <td className="py-4 text-orange-500 font-bold">+{emp.overtime}h</td>
                    <td className="py-4 text-right font-bold">${emp.overtimePay}</td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-bold mb-4">基礎設定</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">基準工時</label>
                <input type="number" value={settings.baseHours} onChange={e => handleSettingChange('baseHours', e.target.value)} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">加班費率</label>
                <input type="number" value={settings.overtimeRate} onChange={e => handleSettingChange('overtimeRate', e.target.value)} className="w-full border p-2 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-bold mb-4">人員管理</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} placeholder="新員工" className="flex-1 border p-2 rounded-lg" />
              <button onClick={addEmployee} className="bg-blue-500 text-white px-4 rounded-lg">新增</button>
            </div>
            <div className="space-y-2">
              {employees.map(e => (
                <div key={e.id} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span>{e.name}</span>
                  <button onClick={() => removeEmployee(e.id)} className="text-red-500"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;