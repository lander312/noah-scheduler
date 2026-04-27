import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Settings, 
  Calendar, 
  Plus, 
  Trash2, 
  Calculator, 
  X,
  Clock,
  Palette,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Award,
  Medal,
  Target
} from 'lucide-react';

// --- 柔和質感佈景主題設定 (Light Themes) ---
const THEMES = {
  morandi: {
    name: '莫蘭迪 (預設)',
    bg: 'bg-[#F4F1ED]',
    cardBg: 'bg-white',
    text: 'text-[#4A4E4D]',
    textMuted: 'text-[#8A8F8E]',
    border: 'border-[#F0EBE5]',
    primary: 'bg-[#8F9E93]',
    primaryHover: 'hover:bg-[#7B8B80]',
    primaryText: 'text-[#8F9E93]',
    gradient: 'from-[#8F9E93] to-[#7B8B80]',
    colors: ['bg-[#8F9E93]', 'bg-[#A8B5B2]', 'bg-[#C2B8B2]', 'bg-[#B5A198]', 'bg-[#8A95A5]']
  },
  ocean: {
    name: '海洋之心',
    bg: 'bg-[#F0F8FF]',
    cardBg: 'bg-white',
    text: 'text-[#2C3E50]',
    textMuted: 'text-[#7F8C8D]',
    border: 'border-[#E1E8ED]',
    primary: 'bg-[#5D9CEC]',
    primaryHover: 'hover:bg-[#4A89DC]',
    primaryText: 'text-[#5D9CEC]',
    gradient: 'from-[#5D9CEC] to-[#4A89DC]',
    colors: ['bg-[#5D9CEC]', 'bg-[#4FC1E9]', 'bg-[#48CFAD]', 'bg-[#A0D468]', 'bg-[#4A89DC]']
  },
  sunset: {
    name: '日落晚霞',
    bg: 'bg-[#FFF5EE]',
    cardBg: 'bg-white',
    text: 'text-[#5C4033]',
    textMuted: 'text-[#A0522D]',
    border: 'border-[#FAD6C4]',
    primary: 'bg-[#FC6E51]',
    primaryHover: 'hover:bg-[#E9573F]',
    primaryText: 'text-[#FC6E51]',
    gradient: 'from-[#FC6E51] to-[#E9573F]',
    colors: ['bg-[#FC6E51]', 'bg-[#FFCE54]', 'bg-[#ED5565]', 'bg-[#F6BB42]', 'bg-[#E9573F]']
  }
};

const COMMON_EMOJIS = [
  // 常用與天氣
  '🌞','🌤️','⛅','🌥️','☁️','🌧️','🌙','⭐','🌴','🏖️','🏠','🏢','🏥','☕','🍔','💤','🏃','💼','🎯','🎉','✨','🔥',
  // 商務與辦公
  '👔','📈','📊','🤝','📝','📅','📱','📞','📋','🗂️','💡',
  // 電腦與科技
  '💻','🖥️','⌨️','🖱️','💾','🎧','🌐','🔋',
  // 出國與交通
  '✈️','🛫','🛬','🌍','🗺️','🛂','🧳','🚢','🚄','🚕'
];

const App = () => {
  // --- Date & Time State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // --- State Management ---
  const [themeId, setThemeId] = useState('morandi');
  const theme = THEMES[themeId];

  const [settings, setSettings] = useState({
    baseHours: 176,
    overtimeRate: 200,
  });

  const [shiftTypes, setShiftTypes] = useState([
    { id: '1', name: '全班', emoji: '🌞', hours: 8, colorIndex: 0 },
    { id: '2', name: '午班', emoji: '🌤️', hours: 4, colorIndex: 1 },
    { id: '3', name: '休假', emoji: '🌴', hours: 0, colorIndex: 2 },
  ]);

  const [employees, setEmployees] = useState([
    { id: '1', name: '陳小明', schedule: {} },
    { id: '2', name: '林小華', schedule: {} },
  ]);

  // UI State
  const [activeTab, setActiveTab] = useState('schedule');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [quickAssignMode, setQuickAssignMode] = useState(null); 
  
  // Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newShift, setNewShift] = useState({ name: '', emoji: '✨', hours: 8 });

  // --- Handlers ---
  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth, 1));
  const getDateKey = (day) => `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const getMonthPrefix = () => `${currentYear}-${String(currentMonth).padStart(2, '0')}-`;
  const handleSettingChange = (key, value) => setSettings(prev => ({ ...prev, [key]: Number(value) || 0 }));

  const addEmployee = () => {
    if (!newEmpName.trim()) return;
    setEmployees(prev => [...prev, { id: Date.now().toString(), name: newEmpName.trim(), schedule: {} }]);
    setNewEmpName('');
  };
  const removeEmployee = (id) => setEmployees(prev => prev.filter(emp => emp.id !== id));

  const addShiftType = () => {
    if (!newShift.name.trim()) return;
    setShiftTypes(prev => [...prev, { id: Date.now().toString(), ...newShift, colorIndex: prev.length }]);
    setNewShift({ name: '', emoji: '✨', hours: 8 });
  };
  const removeShiftType = (id) => setShiftTypes(prev => prev.filter(s => s.id !== id));

  const setSchedule = (empId, dateKey, shiftId) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const newSchedule = { ...emp.schedule };
        if (shiftId === null) delete newSchedule[dateKey];
        else newSchedule[dateKey] = shiftId;
        return { ...emp, schedule: newSchedule };
      }
      return emp;
    }));
  };

  // --- Calculations ---
  const stats = useMemo(() => {
    const monthPrefix = getMonthPrefix();
    return employees.map(emp => {
      let totalHours = 0;
      Object.entries(emp.schedule).forEach(([dateKey, shiftId]) => {
        if (dateKey.startsWith(monthPrefix)) {
          const shift = shiftTypes.find(s => s.id === shiftId);
          if (shift) totalHours += Number(shift.hours);
        }
      });
      const overtime = Math.max(0, totalHours - settings.baseHours);
      return { ...emp, totalHours, overtime, overtimePay: overtime * settings.overtimeRate };
    });
  }, [employees, shiftTypes, settings, currentYear, currentMonth]);

  // 排行榜排序
  const leaderboard = useMemo(() => {
    return [...stats].sort((a, b) => b.totalHours - a.totalHours);
  }, [stats]);

  // --- Components ---
  const Card = ({ children, className = "" }) => (
    <div className={`${theme.cardBg} rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border ${theme.border} p-4 md:p-6 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans p-2 md:p-6 transition-colors duration-500`}>
      {/* Header & Navigation */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`${theme.primary} text-white p-2.5 rounded-xl shadow-sm transition-colors duration-500`}>
            <Calendar size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">智能排班與榮譽系統</h1>
        </div>
        
        <div className={`flex flex-wrap justify-center ${theme.cardBg} rounded-xl shadow-sm p-1 border ${theme.border}`}>
          {[
            { id: 'schedule', icon: Calendar, label: '排班表' },
            { id: 'summary', icon: Calculator, label: '時數結算' },
            { id: 'settings', icon: Settings, label: '設定與管理' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                activeTab === tab.id 
                  ? `${theme.bg} ${theme.text} shadow-sm font-semibold` 
                  : `${theme.textMuted} hover:${theme.text} hover:bg-black/5`
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* TAB: 排班表 */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
            
            {/* 排班主表 */}
            <Card className="overflow-hidden p-0 sm:p-0 md:p-0 border-x-0 sm:border-x xl:col-span-3">
              <div className={`p-4 md:p-5 border-b ${theme.border} flex flex-col md:flex-row items-center justify-between bg-black/[0.02] gap-4`}>
                
                {/* 年月份選擇器 */}
                <div className="flex items-center gap-4 bg-white/60 px-4 py-2 rounded-xl shadow-sm border border-black/5">
                  <button onClick={handlePrevMonth} className={`p-1.5 rounded-lg hover:bg-black/5 transition-colors ${theme.primaryText}`}>
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg md:text-xl font-bold min-w-[120px] text-center tracking-wide">
                    {currentYear} 年 {currentMonth} 月
                  </h2>
                  <button onClick={handleNextMonth} className={`p-1.5 rounded-lg hover:bg-black/5 transition-colors ${theme.primaryText}`}>
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* 快速塗抹工具列 */}
                <div className="flex gap-2 flex-wrap justify-center items-center">
                  <span className={`text-xs ${theme.textMuted} font-medium hidden sm:inline`}>快捷模式：</span>
                  <button onClick={() => setQuickAssignMode(quickAssignMode === 'clear' ? null : 'clear')} className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border shadow-sm transition-all ${quickAssignMode === 'clear' ? 'bg-gray-700 text-white border-gray-700 scale-105' : `bg-white opacity-90 ${theme.border} hover:bg-gray-50`}`}>
                    <Trash2 size={14} />
                    <span className="font-medium">橡皮擦</span>
                  </button>
                  {shiftTypes.map(shift => {
                    const isActive = quickAssignMode === shift.id;
                    const shiftColor = theme.colors[shift.colorIndex % theme.colors.length];
                    return (
                      <button key={shift.id} onClick={() => setQuickAssignMode(isActive ? null : shift.id)} className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border shadow-sm transition-all ${isActive ? `${shiftColor} text-white border-transparent scale-105 ring-2 ring-offset-1 ring-[${shiftColor.replace('bg-','')}]` : `bg-white opacity-90 ${theme.border} hover:bg-gray-50 text-gray-700`}`}>
                        <span className="text-sm">{shift.emoji}</span>
                        <span className="font-medium">{shift.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* 表格 */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-black/[0.02]">
                      <th className={`sticky left-0 bg-white/80 backdrop-blur-md z-20 p-2 md:p-3 text-xs md:text-sm font-semibold opacity-90 border-b border-r ${theme.border} min-w-[80px] md:min-w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap`}>
                        員工姓名
                      </th>
                      {Array.from({ length: daysInMonth }).map((_, i) => (
                        <th key={i} className={`p-1 md:p-1.5 text-center font-medium text-xs md:text-sm opacity-80 border-b ${theme.border} min-w-[34px] sm:min-w-[42px]`}>
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((emp, index) => (
                      <tr key={emp.id} className={`group hover:bg-black/[0.02] transition-colors border-b ${theme.border} last:border-0`}>
                        <td className={`sticky left-0 ${theme.cardBg} group-hover:brightness-95 z-10 p-2 md:p-3 text-xs md:text-sm font-medium border-r ${theme.border} shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors whitespace-nowrap`}>
                          <div className="flex items-center gap-1.5">
                            {/* 溫和的榮譽獎牌標示 */}
                            {index === 0 && <span className="text-sm">🥇</span>}
                            {index === 1 && <span className="text-sm opacity-80">🥈</span>}
                            {index === 2 && <span className="text-sm opacity-60">🥉</span>}
                            <span className={index < 3 ? 'font-semibold' : ''}>{emp.name}</span>
                          </div>
                        </td>
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const dateKey = getDateKey(day);
                          const shiftId = emp.schedule[dateKey];
                          const shift = shiftTypes.find(s => s.id === shiftId);
                          const shiftColor = shift ? theme.colors[shift.colorIndex % theme.colors.length] : '';
                          
                          return (
                            <td key={day} className={`p-[2px] sm:p-1 border-x border-transparent hover:${theme.border}`}>
                              <button onClick={() => quickAssignMode !== null && setSchedule(emp.id, dateKey, quickAssignMode === 'clear' ? null : quickAssignMode)} className={`h-10 sm:h-11 w-full rounded-lg flex flex-col items-center justify-center gap-[2px] pt-1 pb-0.5 transition-all duration-200 active:scale-90 overflow-hidden ${shift ? `${shiftColor} text-white shadow-sm hover:brightness-110` : 'bg-black/[0.03] text-transparent hover:bg-black/10'} ${quickAssignMode !== null ? 'cursor-crosshair' : 'cursor-pointer'}`}>
                                {shift && (
                                  <>
                                    <span className="text-sm sm:text-base leading-none">{shift.emoji}</span>
                                    <span className="text-[9px] opacity-95 hidden lg:block tracking-tighter whitespace-nowrap scale-[0.85]">
                                      {shift.name.substring(0,2)}
                                    </span>
                                  </>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-2 text-center text-[10px] opacity-40 bg-black/5">
                提示：若畫面無法完全顯示，您可以按住 Shift 鍵並滑動滾輪進行橫向拖曳。
              </div>
            </Card>

            {/* 🏆 優雅版：榮譽榜與進度條 🏆 */}
            <Card className="xl:col-span-1 shadow-sm relative overflow-hidden bg-white">
              <div className="absolute -top-4 -right-4 p-3 opacity-5">
                <Trophy size={120} className={theme.primaryText} />
              </div>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Award size={20} className={theme.primaryText} />
                本月工時榮譽榜
              </h3>
              <ul className="space-y-4">
                {leaderboard.slice(0, 5).map((emp, index) => {
                  const progress = Math.min(100, (emp.totalHours / settings.baseHours) * 100);
                  const isTop3 = index < 3;
                  return (
                    <li key={emp.id} className={`p-3.5 rounded-xl border ${isTop3 ? theme.border : 'border-transparent'} bg-black/[0.02] flex flex-col gap-2 relative transition-all hover:shadow-sm`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold opacity-40`}>#{index + 1}</span>
                          <span className={`font-semibold text-sm ${isTop3 ? theme.text : theme.textMuted}`}>{emp.name}</span>
                        </div>
                        <div className={`text-sm font-bold ${isTop3 ? theme.text : theme.textMuted}`}>
                          {emp.totalHours.toFixed(1)} <span className="text-xs font-normal opacity-70">h</span>
                        </div>
                      </div>
                      {/* 優雅的進度條 */}
                      <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${theme.primary} ${progress >= 100 ? 'opacity-100' : 'opacity-70'}`} style={{ width: `${progress}%` }} />
                      </div>
                      <div className="text-[10px] text-right opacity-40 mt-[-2px]">
                        目標 {settings.baseHours}h
                      </div>
                    </li>
                  );
                })}
              </ul>
              {employees.length === 0 && (
                <div className="text-center text-sm opacity-40 pt-10">尚無排班資料</div>
              )}
            </Card>
          </div>
        )}

{/* TAB: 時數結算 */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 卡片 1：基準工時 */}
              <div className={`${theme.colors[0]} text-white rounded-2xl shadow-md p-6 relative overflow-hidden group transition-all hover:shadow-lg`}>
                <div className="absolute -right-4 -top-4 opacity-[0.2] group-hover:scale-110 transition-transform duration-500">
                  <Target size={120} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="text-white/90 text-sm font-semibold mb-1 flex items-center gap-1.5">
                    <Target size={18} /> 基準工時
                  </div>
                  <div className="text-4xl font-black mt-2">
                    {settings.baseHours} <span className="text-lg font-medium opacity-90">小時</span>
                  </div>
                </div>
              </div>

              {/* 卡片 2：加班費率 */}
              <div className={`${theme.colors[2]} text-white rounded-2xl shadow-md p-6 relative overflow-hidden group transition-all hover:shadow-lg`}>
                <div className="absolute -right-4 -top-4 opacity-[0.2] group-hover:scale-110 transition-transform duration-500">
                  <Calculator size={120} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="text-white/90 text-sm font-semibold mb-1 flex items-center gap-1.5">
                    <Calculator size={18} /> 加班費率
                  </div>
                  <div className="text-4xl font-black mt-2">
                    <span className="text-xl font-medium mr-1 opacity-90">$</span>{settings.overtimeRate} <span className="text-lg font-medium opacity-90">/小時</span>
                  </div>
                </div>
              </div>

              {/* 卡片 3：當月天數 */}
              <div className={`${theme.colors[4]} text-white rounded-2xl shadow-md p-6 relative overflow-hidden group transition-all hover:shadow-lg`}>
                <div className="absolute -right-4 -top-4 opacity-[0.2] group-hover:scale-110 transition-transform duration-500">
                  <Calendar size={120} strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="text-white/90 text-sm font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar size={18} /> {currentMonth} 月總天數
                  </div>
                  <div className="text-4xl font-black mt-2">
                    {daysInMonth} <span className="text-lg font-medium opacity-90">天</span>
                  </div>
                </div>
              </div>
              
            </div>

            <Card>
              <div className="p-2">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <Calculator size={20} className={theme.primaryText} />
                  {currentYear} 年 {currentMonth} 月 - 榮譽結算表
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className={`text-sm border-b ${theme.border} opacity-80`}>
                        <th className="pb-3 pl-2 font-medium">員工姓名</th>
                        <th className="pb-3 font-medium">總工時</th>
                        <th className="pb-3 font-medium">基本工時</th>
                        <th className="pb-3 font-medium text-amber-600">加班時數</th>
                        <th className={`pb-3 font-medium ${theme.primaryText}`}>預估加班費</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.border} divide-opacity-50`}>
                      {leaderboard.map(emp => (
                        <tr key={emp.id} className="hover:bg-black/5 transition-colors">
                          <td className="py-4 pl-2 font-medium">{emp.name}</td>
                          <td className="py-4 font-semibold">{emp.totalHours.toFixed(1)} h</td>
                          <td className="py-4 opacity-70">{settings.baseHours} h</td>
                          <td className="py-4 font-bold text-amber-600">{emp.overtime > 0 ? `+${emp.overtime.toFixed(1)} h` : '-'}</td>
                          <td className={`py-4 font-bold ${theme.primaryText}`}>{emp.overtimePay > 0 ? `$ ${emp.overtimePay.toLocaleString()}` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB: 設定與管理 */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            {/* 主題切換器 */}
            <Card className="md:col-span-2">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Palette size={20} className={theme.primaryText} />
                外觀與佈景主題
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(THEMES).map(([id, t]) => (
                  <button key={id} onClick={() => setThemeId(id)} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${t.bg} ${t.text} ${themeId === id ? `border-gray-400 shadow-md scale-[1.02]` : 'border-transparent hover:brightness-95'}`}>
                    <div className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center ${t.primary}`}>
                      {themeId === id && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-semibold">{t.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <Settings size={20} className={theme.primaryText} />
                全域時數設定
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-2">基準工時 (小時/月) - <span className="text-xs opacity-60">超過即算加班</span></label>
                  <input type="number" value={settings.baseHours} onChange={e => handleSettingChange('baseHours', e.target.value)} className={`w-full p-3 rounded-xl border ${theme.border} bg-white/50 focus:ring-2 focus:ring-[${theme.primary.replace('bg-','')}] outline-none transition-all`} />
                </div>
                <div>
                  <label className="block text-sm font-medium opacity-80 mb-2">加班費率 (元/小時)</label>
                  <input type="number" value={settings.overtimeRate} onChange={e => handleSettingChange('overtimeRate', e.target.value)} className={`w-full p-3 rounded-xl border ${theme.border} bg-white/50 focus:ring-2 focus:ring-[${theme.primary.replace('bg-','')}] outline-none transition-all`} />
                </div>
                <div className="p-3 bg-black/5 rounded-xl border border-black/5 text-sm opacity-70">
                  ℹ️ 當月天數將根據排班表面板上方選擇自動計算。
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <Users size={20} className={theme.primaryText} />
                人員管理
              </h2>
              <div className="flex gap-2 mb-6">
                <input type="text" placeholder="輸入員工姓名" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} onKeyPress={e => e.key === 'Enter' && addEmployee()} className={`flex-1 p-3 rounded-xl border ${theme.border} bg-white/50 focus:ring-2 focus:ring-[${theme.primary.replace('bg-','')}] outline-none transition-all`} />
                <button onClick={addEmployee} className={`${theme.primary} ${theme.primaryHover} text-white px-4 rounded-xl transition-colors flex items-center justify-center active:scale-95`}>
                  <Plus size={20} />
                </button>
              </div>
              <ul className="space-y-2">
                {employees.map(emp => (
                  <li key={emp.id} className={`flex justify-between items-center p-3 rounded-xl bg-black/5 border ${theme.border}`}>
                    <span className="font-medium">{emp.name}</span>
                    <button onClick={() => removeEmployee(emp.id)} className="opacity-40 hover:opacity-100 transition-opacity p-1 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="md:col-span-2">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <Clock size={20} className={theme.primaryText} />
                班別管理
              </h2>
              <div className="flex flex-wrap gap-3 mb-6 items-end relative">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium opacity-80 mb-1">班別名稱</label>
                  <input type="text" value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} placeholder="例如: 全班" className={`w-full p-3 rounded-xl border ${theme.border} bg-white/50 focus:ring-2 focus:ring-[${theme.primary.replace('bg-','')}] outline-none transition-all`} />
                </div>
                
                <div className="w-24 relative">
                  <label className="block text-xs font-medium opacity-80 mb-1">圖示</label>
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`w-full p-3 flex justify-between items-center rounded-xl border ${theme.border} bg-white/50 focus:ring-2 outline-none transition-all`}>
                    <span className="text-lg leading-none">{newShift.emoji}</span>
                    <ChevronDown size={14} className="opacity-50" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                        <span className="text-xs font-medium text-gray-500">選擇圖示</span>
                        <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-gray-700">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                        {COMMON_EMOJIS.map(e => (
                          <button key={e} onClick={() => { setNewShift({...newShift, emoji: e}); setShowEmojiPicker(false); }} className="hover:bg-gray-100 rounded-lg p-1 text-xl flex items-center justify-center transition-colors hover:scale-110">
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-24">
                  <label className="block text-xs font-medium opacity-80 mb-1">時數</label>
                  <input type="number" step="0.5" value={newShift.hours} onChange={e => setNewShift({...newShift, hours: Number(e.target.value)})} className={`w-full p-3 rounded-xl border ${theme.border} bg-white/50 focus:ring-2 outline-none transition-all`} />
                </div>
                <button onClick={addShiftType} className={`${theme.primary} ${theme.primaryHover} text-white p-3 rounded-xl transition-colors active:scale-95 h-[50px] px-4 md:px-6 font-medium whitespace-nowrap`}>
                  新增班別
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {shiftTypes.map(shift => (
                  <div key={shift.id} className={`${theme.colors[shift.colorIndex % theme.colors.length]} text-white rounded-xl p-3 md:p-4 relative group shadow-sm hover:shadow-md transition-all`}>
                    <button onClick={() => removeShiftType(shift.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 p-1 rounded-full hover:bg-black/40">
                      <X size={14} />
                    </button>
                    <div className="text-2xl md:text-3xl mb-1 md:mb-2">{shift.emoji}</div>
                    <div className="font-medium text-sm md:text-base">{shift.name}</div>
                    <div className="text-xs md:text-sm opacity-90">{shift.hours} 小時</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* --- Footer --- */}
      <footer className={`max-w-7xl mx-auto mt-16 pt-8 border-t ${theme.border} text-center text-sm opacity-80 pb-8 transition-colors duration-500`}>
        <div className="space-y-1 mb-4">
          <p>本工具僅供個人學習與交流使用。</p>
          <p>所有資料來源於 <a href="https://noah999.com.tw" target="_blank" rel="noreferrer" className="underline font-medium hover:text-blue-500 transition-colors">NOAHSHOP</a>，版權歸原作者及所有。</p>
          <p>請勿用於任何商業用途，如有侵權請聯絡移除。</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs mt-6">
          <span className="bg-black/5 px-3 py-1.5 rounded-full">作者：ryan3123</span>
          <a href="mailto:ryan3123@example.com" className="bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
            問題回報
          </a>
          <a href="https://noah999.com.tw" target="_blank" rel="noreferrer" className={`${theme.primary} ${theme.primaryHover} text-white px-4 py-1.5 rounded-full font-medium shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5`}>
            🔥 參觀 NOAH999 官網
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;