/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Appliance, calculateEgyptianBill, CATEGORY_METADATA } from '../types';
import { Calendar, BarChart3, AlertCircle, Info, Zap, TrendingUp } from 'lucide-react';

interface ConsumptionChartsProps {
  appliances: Appliance[];
}

export default function ConsumptionCharts({ appliances }: ConsumptionChartsProps) {
  const [activeTab, setActiveTab] = useState<'monthly' | 'appliances'>('monthly');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(6); // Default July (Summer)

  // Monthly factors (multipliers for heating/cooling to simulate real seasonal changes in Egypt)
  // Egypt has hot summers (Jul, Aug, Sep) and mild winters (Dec, Jan, Feb)
  const MONTHS = [
    { name: "يناير", enName: "Jan", coolingFactor: 0.1, heatingFactor: 1.8, baseFactor: 0.9, temp: "18°C" },
    { name: "فبراير", enName: "Feb", coolingFactor: 0.1, heatingFactor: 1.6, baseFactor: 0.9, temp: "19°C" },
    { name: "مارس", enName: "Mar", coolingFactor: 0.3, heatingFactor: 0.8, baseFactor: 1.0, temp: "22°C" },
    { name: "أبريل", enName: "Apr", coolingFactor: 0.6, heatingFactor: 0.2, baseFactor: 1.0, temp: "26°C" },
    { name: "مايو", enName: "May", coolingFactor: 1.0, heatingFactor: 0.0, baseFactor: 1.0, temp: "31°C" },
    { name: "يونيو", enName: "Jun", coolingFactor: 1.4, heatingFactor: 0.0, baseFactor: 1.1, temp: "35°C" },
    { name: "يوليو", enName: "Jul", coolingFactor: 1.8, heatingFactor: 0.0, baseFactor: 1.2, temp: "38°C" },
    { name: "أغسطس", enName: "Aug", coolingFactor: 1.9, heatingFactor: 0.0, baseFactor: 1.2, temp: "39°C" },
    { name: "سبتمبر", enName: "Sep", coolingFactor: 1.3, heatingFactor: 0.0, baseFactor: 1.1, temp: "33°C" },
    { name: "أكتوبر", enName: "Oct", coolingFactor: 0.8, heatingFactor: 0.2, baseFactor: 1.0, temp: "29°C" },
    { name: "نوفمبر", enName: "Nov", coolingFactor: 0.3, heatingFactor: 1.0, baseFactor: 0.9, temp: "24°C" },
    { name: "ديسمبر", enName: "Dec", coolingFactor: 0.1, heatingFactor: 1.7, baseFactor: 0.9, temp: "19°C" }
  ];

  // Calculate monthly stats based on seasonal factor offsets
  const calculateKWhForMonth = (monthIdx: number) => {
    const month = MONTHS[monthIdx];
    let totalKWh = 0;

    appliances.forEach(app => {
      let multiplier = month.baseFactor;
      if (app.category === 'cooling') {
        multiplier = month.coolingFactor;
      } else if (app.category === 'heating') {
        multiplier = month.heatingFactor;
      }
      
      const appDailyKWh = (app.watts * (app.hoursPerDay * multiplier) * app.quantity) / 1000;
      totalKWh += appDailyKWh * 30; // 30 days in a billing month
    });

    return Math.max(0, Math.round(totalKWh * 10) / 10);
  };

  const monthlyData = MONTHS.map((_, idx) => {
    const kWh = calculateKWhForMonth(idx);
    const bill = calculateEgyptianBill(kWh);
    return {
      monthIdx: idx,
      monthName: MONTHS[idx].name,
      temp: MONTHS[idx].temp,
      kWh,
      costEGP: bill.totalCostEGP,
      tierId: bill.currentTierId
    };
  });

  // Calculate appliance monthly share based on a typical medium-load month (May, multiplier = 1)
  const applianceShares = appliances.map(app => {
    const monthlyKWh = (app.watts * app.hoursPerDay * app.quantity * 30) / 1000;
    const costShare = monthlyKWh * 1.5; // Estimated EGP weight
    return {
      id: app.id,
      name: app.arabicName || app.name,
      watt: app.watts,
      hours: app.hoursPerDay,
      qty: app.quantity,
      kWh: Math.round(monthlyKWh * 10) / 10,
      category: app.category
    };
  }).sort((a, b) => b.kWh - a.kWh);

  const maxMonthlyKWh = Math.max(...monthlyData.map(d => d.kWh), 10);
  const maxApplianceKWh = Math.max(...applianceShares.map(d => d.kWh), 1);
  const totalAnnualKWh = Math.round(monthlyData.reduce((acc, curr) => acc + curr.kWh, 0));
  const totalAnnualCost = Math.round(monthlyData.reduce((acc, curr) => acc + curr.costEGP, 0));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>الرسوم البيانية والتحليل التفاعلي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">تتبع التغيرات الموسمية واكتشف مباخر الطاقة المخفية</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${activeTab === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            التتبع الموسمي الشهري
          </button>
          <button
            onClick={() => setActiveTab('appliances')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${activeTab === 'appliances' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            استهلاك الأجهزة الفردي
          </button>
        </div>
      </div>

      {appliances.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mb-2 text-slate-300" />
          <p className="text-sm font-medium">الرجاء إضافة بعض الأجهزة أولاً لرسم مخططات الاستهلاك</p>
        </div>
      ) : activeTab === 'monthly' ? (
        // SEASONAL MONTHLY TRACKING CHART
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-500 block">إجمالي استهلاك السنة</span>
              <span className="text-xl font-bold text-indigo-950 font-mono mt-1 block">{totalAnnualKWh.toLocaleString()} <span className="text-xs font-medium">ك.و.س</span></span>
            </div>
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-110">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 block">الفاتورة السنوية التقديرية</span>
              <span className="text-xl font-bold text-emerald-950 font-mono mt-1 block">{totalAnnualCost.toLocaleString()} <span className="text-xs font-medium">جنيه</span></span>
            </div>
            <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-500 block">أعلى شهر فاتورة (أغسطس)</span>
              <span className="text-xl font-bold text-rose-950 font-mono mt-1 block">
                {Math.round(monthlyData[7].costEGP).toLocaleString()} <span className="text-xs font-medium">جنيه</span>
              </span>
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">معدل الاستهلاك الشهري</span>
              <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
                {Math.round(totalAnnualKWh / 12).toLocaleString()} <span className="text-xs font-medium">ك.و.س</span>
              </span>
            </div>
          </div>

          {/* Core Interactive SVG Bar Chart */}
          <div className="relative flex-1 min-h-[220px]">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-100 text-[10px] text-slate-400 font-mono">
              <div className="border-t border-dashed border-slate-100 pt-1">الحد الأقصى الحالي {Math.round(maxMonthlyKWh)} ك.و.س</div>
              <div className="border-t border-dashed border-slate-100 pt-1">{Math.round(maxMonthlyKWh * 0.66)} ك.و.س</div>
              <div className="border-t border-dashed border-slate-100 pt-1">{Math.round(maxMonthlyKWh * 0.33)} ك.و.s</div>
              <div className="pt-1">0 ك.و.س</div>
            </div>

            {/* SVG Bars Container */}
            <div className="absolute inset-0 bottom-6 flex items-end justify-between gap-2 pt-6">
              {monthlyData.map((d, idx) => {
                const heightPct = Math.max(5, (d.kWh / maxMonthlyKWh) * 100);
                const isSelected = selectedMonthIdx === idx;
                const isSummer = idx >= 5 && idx <= 8; // Summer in Egypt

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedMonthIdx(idx)}
                    className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer focus:outline-none"
                  >
                    {/* Hover indicator tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white rounded-lg p-2 text-[10px] text-center opacity-0 group-hover:opacity-100 focus:opacity-100 pointer-events-none shrink-0 transition-opacity whitespace-nowrap shadow-xl z-20">
                      <p className="font-bold">{d.monthName} ({d.temp})</p>
                      <p className="font-mono text-amber-400 mt-0.5">{d.kWh} ك.و.س</p>
                      <p className="font-mono text-emerald-400">{d.costEGP} جنيه</p>
                    </div>

                    {/* Bar Pillar */}
                    <div 
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 relative ${
                        isSelected 
                          ? 'bg-indigo-650 shadow-[0_0_12px_rgba(79,70,229,0.35)]' 
                          : isSummer 
                            ? 'bg-indigo-400/80 hover:bg-indigo-400' 
                            : 'bg-slate-300/80 hover:bg-indigo-500/50'
                      }`}
                    >
                      {/* Internal spark glowing dot for active selected month */}
                      {isSelected && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Labels beneath chart */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-bold text-slate-500 font-sans border-t border-slate-100 pt-2 shrink-0">
              {monthlyData.map((d, idx) => (
                <span 
                  key={idx} 
                  className={`flex-1 text-center truncate ${selectedMonthIdx === idx ? 'text-indigo-650 scale-110 font-bold' : ''}`}
                >
                  {d.monthName}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Highlight Widget of Clicked Month */}
          <div className="mt-6 bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex-1 text-right sm:text-right">
              <h4 className="text-sm font-bold text-slate-800">تفاصيل الاستهلاك في شهر: {monthlyData[selectedMonthIdx].monthName}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                في هذا الشهر، تكون درجة الحرارة المتوسطة حوالي <span className="font-semibold text-slate-700">{monthlyData[selectedMonthIdx].temp}</span> في مصر. 
                {selectedMonthIdx >= 5 && selectedMonthIdx <= 8 ? " يزيد استهلاك أجهزة التبريد مثل مكيفات الهواء بكثافة بحدود 1.8 ضعف لمقاومة حر الصيف." : " متوسط استهلاك أجهزة التبريد منخفض جداً، بينما ينشط تشغيل غلايات الشاي وسخانات المياه الكهربية."}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-center">
                <span className="text-[9px] text-slate-400 block font-medium">الاستهلاك المتوقع</span>
                <span className="text-xs font-bold font-mono text-indigo-600">{monthlyData[selectedMonthIdx].kWh} <span className="text-[9px] font-normal">ك.و.س</span></span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-center">
                <span className="text-[9px] text-slate-400 block font-medium">تكلفة الفاتورة</span>
                <span className="text-xs font-bold font-mono text-emerald-600">{monthlyData[selectedMonthIdx].costEGP} <span className="text-[9px] font-normal">جنيه</span></span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // APPLIANCE INDIVIDUAL SHARE COMPARATIVE BAR CHART
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-3 text-amber-800 border border-amber-100 text-xs mb-4">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <p>يعرض هذا الترتيب الأجهزة الأكثر التهاماً للطاقة والكهرباء شهرياً داخل منزلك حالياً لتقرر أين يجب التوفير الفوري.</p>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {applianceShares.map((app, idx) => {
              const pctOfMax = (app.kWh / maxApplianceKWh) * 100;
              const categoryColorObj = CATEGORY_METADATA[app.category] || CATEGORY_METADATA.other;
              const isHeavyConsumer = app.watt >= 1000 || app.kWh > 100;

              return (
                <div key={app.id} className="group relative">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className={`w-2.5 h-2.5 rounded-full ${categoryColorObj.color}`} />
                      <span className="font-bold">{app.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({app.watt} واط × {app.hours}س × {app.qty}جهاز)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-800">{app.kWh} ك.و.س/شهر</span>
                      {isHeavyConsumer && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                          عالي الاستهلاك 🔥
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progressive Bar track */}
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200/40">
                    <div 
                      style={{ width: `${pctOfMax}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHeavyConsumer ? 'bg-gradient-to-r from-red-500 to-amber-500' : categoryColorObj.color
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick analysis summary */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-500" />
              أكبر جهاز ملتهم للطاقة بمنزلك: <strong className="text-red-700">{applianceShares[0]?.name}</strong>
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              أقل الأجهزة استهلاكاً: <strong className="text-teal-600">{applianceShares[applianceShares.length - 1]?.name}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
