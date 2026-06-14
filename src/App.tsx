/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { calculateEgyptianBill, Appliance } from './types';
import BarcodeScanner from './components/BarcodeScanner';
import ApplianceList from './components/ApplianceList';
import TariffGuide from './components/TariffGuide';
import ConsumptionCharts from './components/ConsumptionCharts';
import AIAdvisor from './components/AIAdvisor';
import { 
  Zap, 
  HelpCircle, 
  Settings, 
  QrCode, 
  Home, 
  Brain, 
  BarChart3, 
  AlertTriangle,
  Info,
  Layers,
  Leaf,
  DollarSign
} from 'lucide-react';

// Default initial appliances to avoid blank dashboard on first loading
const INITIAL_APPLIANCES: Appliance[] = [
  { id: "1", name: "LED Light Bulb (15W)", arabicName: "لمبة ليد موفرة (15 وات)", watts: 15, hoursPerDay: 6, quantity: 6, category: 'lighting' },
  { id: "2", name: "Refrigerator", arabicName: "ثلاجة منزلية بابين", watts: 250, hoursPerDay: 24, quantity: 1, category: 'cooling' },
  { id: "3", name: "Television (LED 43\")", arabicName: "شاشة تلفزيون (43 بوصة)", watts: 80, hoursPerDay: 8, quantity: 1, category: 'entertainment' },
  { id: "4", name: "Electric Water Heater", arabicName: "سخان مياه كهربائي", watts: 1500, hoursPerDay: 2.5, quantity: 1, category: 'heating' }
];

export default function App() {
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    const saved = localStorage.getItem('egypt_appliances');
    return saved ? JSON.parse(saved) : INITIAL_APPLIANCES;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices' | 'advisor'>('dashboard');

  useEffect(() => {
    localStorage.setItem('egypt_appliances', JSON.stringify(appliances));
  }, [appliances]);

  // Derived calculations
  const calculateTotalMonthlyKWh = () => {
    let totalKWh = 0;
    appliances.forEach(app => {
      // (watts * hours/day * qty * 30 days) / 1000
      const appDaily = (app.watts * app.hoursPerDay * app.quantity) / 1000;
      totalKWh += appDaily * 30;
    });
    return Math.max(0, Math.round(totalKWh * 10) / 10);
  };

  const totalMonthlyKWh = calculateTotalMonthlyKWh();
  const calculation = calculateEgyptianBill(totalMonthlyKWh);

  // Carbon footprint estimate: ~0.45 kg of CO2 per kWh in Egypt
  const carbonFootprintKg = Math.round(totalMonthlyKWh * 0.45);

  const handleAddAppliance = (newApp: Omit<Appliance, 'id'>) => {
    const applianceWithId: Appliance = {
      ...newApp,
      id: Math.random().toString(36).substr(2, 9)
    };
    setAppliances(prev => [...prev, applianceWithId]);
  };

  const handleDeleteAppliance = (id: string) => {
    setAppliances(prev => prev.filter(app => app.id !== id));
  };

  const handleUpdateAppliance = (id: string, updates: Partial<Omit<Appliance, 'id'>>) => {
    setAppliances(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));
  };

  const handleResetAll = () => {
    if (window.confirm("هل تريد بالتأكيد إفراغ قائمة أجهزتك المسجلة بالكامل؟")) {
      setAppliances([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-150 font-sans text-right select-none" dir="rtl">
      {/* Visual top border with Egypt Colors */}
      <div className="h-1 bg-gradient-to-r from-red-650 via-slate-100 to-black shrink-0" />

      {/* Main Header Container in High Density Slate Dark style */}
      <header className="bg-slate-800 border-b border-slate-700 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0">
              <Zap className="w-5 h-5 stroke-[2.25] text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>احسب فاتورتك</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-md">النسخة الذكية بالباركود</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبيق حساب الاستهلاك المنزلي بالجنيه المصري ومطابقة شرائح الطاقة المعتمدة
              </p>
            </div>
          </div>

          {/* Quick Stats Summary badges */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="bg-slate-700/40 text-slate-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-600">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>الأثر الكربوني: {carbonFootprintKg} كجم CO₂/شهرياً</span>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>إجمالي الاستهلاك: {totalMonthlyKWh} ك.و.س</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Workspace Sizing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Navigation Switchers - High Density themed */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 max-w-md mx-auto mb-6 shadow-md">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>لوحة التحكم والتحليل</span>
          </button>
          
          <button
            onClick={() => setActiveTab('devices')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'devices' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>مسح الباركود والأجهزة</span>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'advisor' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>مستشار الترشيد وجيميني</span>
          </button>
        </div>

        {/* CONTROLS DISPLAY BASE ON TABS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Summary Stat Grid Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Estimated Bill in EGP */}
              <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">الفاتورة الشهرية المتوقعة</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                    {calculation.totalCostEGP} <span className="text-xs font-bold font-sans text-slate-400">جنيه مصرى</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">رسوم الخدمة شاملة: {calculation.serviceFeeEGP}ج</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-xs shrink-0 border border-emerald-500/20">
                  <DollarSign className="w-5 h-5 stroke-[2.25]" />
                </div>
              </div>

              {/* Card 2: Combined consumption KWh */}
              <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">إجمالي كيلوات الطاقة</span>
                  <div className="text-xl font-black text-indigo-450 font-mono mt-1">
                    {totalMonthlyKWh} <span className="text-xs font-bold font-sans text-slate-400">ك.و.س/شهر</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">الاستهلاك اليومي: {(totalMonthlyKWh / 30).toFixed(2)} ك.و.س</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-xs shrink-0 border border-indigo-500/20">
                  <Zap className="w-5 h-5 stroke-[2.25]" />
                </div>
              </div>

              {/* Card 3: Current Tariff Slabs */}
              <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">الشريحة المحتسبة حالياً</span>
                  <div className="text-base font-extrabold text-slate-200 mt-1 flex items-center gap-1.5">
                    <span>الشريحة {calculation.currentTierId}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">نشطة</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">سعر الكيلووات: {calculation.tierBreakdown[calculation.tierBreakdown.length - 1]?.rate || 0.68} جنيه</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300 shadow-xs shrink-0 border border-slate-600">
                  <Layers className="w-5 h-5 stroke-[2.25]" />
                </div>
              </div>

              {/* Card 4: Consumption Indicator / Energy Health */}
              <div className="bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">مستوى وترشيد الطاقة</span>
                  <div className="text-base font-extrabold mt-1">
                    {totalMonthlyKWh <= 100 ? (
                      <span className="text-emerald-400 font-bold">ممتاز 🟢</span>
                    ) : totalMonthlyKWh <= 350 ? (
                      <span className="text-amber-400 font-bold">مقبول 🟡</span>
                    ) : totalMonthlyKWh <= 650 ? (
                      <span className="text-orange-400 font-bold">مرتفع 🟠</span>
                    ) : (
                      <span className="text-rose-450 font-black">حرج وخطير 🔥</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-550 mt-1 block leading-tight">
                    {totalMonthlyKWh <= 100 
                      ? "تحصل على أعلى دعم بالدولة." 
                      : totalMonthlyKWh <= 350 
                        ? "اعتيادي، تجنب الشرائح العليا." 
                        : "تجاوزت حاجز الدعم المتدرج!"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-xs shrink-0 border border-amber-500/25">
                  <AlertTriangle className="w-5 h-5 stroke-[2.25]" />
                </div>
              </div>
            </div>

            {/* Middle Row: Seasonal analytical charts and Appliance Manager list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive custom graphical charts display */}
              <ConsumptionCharts appliances={appliances} />

              {/* Step by step tariff break down results */}
              <TariffGuide calculation={calculation} />
            </div>

            {/* Quick appliances catalog and adjustments in real-time */}
            <div>
              <ApplianceList 
                appliances={appliances}
                onDeleteAppliance={handleDeleteAppliance}
                onUpdateAppliance={handleUpdateAppliance}
                onAddAppliance={handleAddAppliance}
                onResetAll={handleResetAll}
              />
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="space-y-6 animate-fade-in">
            {/* Interactive smart Barcode Reader and manual input boxes */}
            <BarcodeScanner onAddAppliance={handleAddAppliance} />

            {/* Show loaded list beneath for validation context */}
            <ApplianceList 
              appliances={appliances}
              onDeleteAppliance={handleDeleteAppliance}
              onUpdateAppliance={handleUpdateAppliance}
              onAddAppliance={handleAddAppliance}
              onResetAll={handleResetAll}
            />
          </div>
        )}

        {activeTab === 'advisor' && (
          <div className="space-y-6 animate-fade-in">
            {/* Real Gemini powered audit consultant panels */}
            <AIAdvisor appliances={appliances} />
          </div>
        )}

      </main>

      {/* Informative Footer displaying details and carbon index values */}
      <footer className="bg-slate-950 text-slate-400 py-10 px-6 mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right">
            <h3 className="text-white font-bold text-md flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-450" />
              <span>المنزل المصري الأخضر لترشيد الطاقة</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
              تطبيق مستقل لمساعدة العائلات المصرية على التحكم المنهجي الذاتي في فواتير الكهرباء وتفادي القفزات الفجائية بين الشرائح، مع تقليل البصمة الكربونية والمحافظة على ميزانية البيت.
            </p>
          </div>
          <div className="text-slate-500 text-xs font-mono flex flex-col items-end gap-1 font-medium">
            <span>تم الاحتساب بالاعتماد على أسعار الشرائح الرسمية والمعتمدة بجمهورية مصر العربية</span>
            <span>الأثر البيئي: كل 1 ك.و.س طاقة يوّلد ~0.45 كجم CO₂ كربون فاقد</span>
            <span className="text-[10px] text-slate-650 mt-1">حقوق الملكية الفكرية محفوظة © 2026. احسب فاتورتك بالباركود. </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
