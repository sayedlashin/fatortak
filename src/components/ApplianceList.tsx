/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Appliance, TYPICAL_EGYPTIAN_APPLIANCES, CATEGORY_METADATA } from '../types';
import { Trash2, AlertCircle, Plus, Sparkles, Sliders, Hourglass, Zap, Layers, RefreshCw } from 'lucide-react';

interface ApplianceListProps {
  appliances: Appliance[];
  onDeleteAppliance: (id: string) => void;
  onUpdateAppliance: (id: string, updates: Partial<Omit<Appliance, 'id'>>) => void;
  onAddAppliance: (appliance: Omit<Appliance, 'id'>) => void;
  onResetAll: () => void;
}

export default function ApplianceList({
  appliances,
  onDeleteAppliance,
  onUpdateAppliance,
  onAddAppliance,
  onResetAll
}: ApplianceListProps) {

  const addPreset = (presetName: string) => {
    const match = TYPICAL_EGYPTIAN_APPLIANCES.find(p => p.name === presetName || p.arabicName === presetName);
    if (match) {
      onAddAppliance({
        ...match,
        id: Math.random().toString(36).substr(2, 9)
      } as any);
    }
  };

  const getCategoryIcon = (category: Appliance['category']) => {
    const metadata = CATEGORY_METADATA[category] || CATEGORY_METADATA.other;
    return metadata.icon;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>الأجهزة الحالية بالمنزل</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">اضبط تفاصيل ساعات التشغيل والكميات يدوياً لرؤية التغيير الفوري</p>
        </div>
        
        {appliances.length > 0 && (
          <button
            onClick={onResetAll}
            className="text-xs text-rose-600 font-semibold hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            إفراغ القائمة والبدء من جديد
          </button>
        )}
      </div>

      {/* QUICK PRESET ADD PANEL */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>إضافة سريعة لأشهر أجهزة البيت المصري</span>
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-right">
          {TYPICAL_EGYPTIAN_APPLIANCES.slice(0, 8).map((preset, idx) => (
            <button
              key={idx}
              onClick={() => addPreset(preset.name)}
              className="bg-slate-50 hover:bg-slate-105 border border-slate-200 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl shrink-0 transition-all flex items-center gap-1 hover:border-amber-500 cursor-pointer"
            >
              <Plus className="w-3 h-3 text-slate-400" />
              <span>{preset.arabicName}</span>
            </button>
          ))}
        </div>
      </div>

      {appliances.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-150 rounded-2xl bg-slate-50/50">
          <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-700 font-bold text-sm">لم تقم بإضافة أي أجهزة كهربائية بعد</p>
          <p className="text-slate-400 text-xs mt-1.5 max-w-sm">
            يمكنك استخدام الكاميرا لمسح الباركود، أو إدخال جهاز ببياناته يدوياً، أو الضغط على الأزرار السريعة بالأعلى لتجربة حساب الاستهلاك وتوضيح الشرائح المناسبة لميزانيتك.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px] pr-1">
          {appliances.map((app) => {
            const monthlyKWh = Math.round(((app.watts * app.hoursPerDay * app.quantity * 30) / 1000) * 10) / 10;
            const categoryMeta = CATEGORY_METADATA[app.category] || CATEGORY_METADATA.other;

            return (
              <div 
                key={app.id} 
                className="bg-white border border-slate-150 hover:border-slate-305 rounded-2xl p-4 transition-all hover:shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Info block */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl ${categoryMeta.color} bg-opacity-10 text-right shrink-0 ${categoryMeta.text}`}>
                    <Sliders className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight truncate">{app.arabicName || app.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      القدرة: {app.watts} واط | {categoryMeta.label}
                    </p>
                    {app.barcode && (
                      <span className="inline-block bg-slate-100 text-slate-500 font-mono text-[9px] px-1.5 py-0.5 rounded-md mt-1 font-semibold">
                        باركود: {app.barcode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive sliders/controls */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {/* Hours adjust */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 justify-end">
                      <Hourglass className="w-3 h-3 text-slate-450" />
                      <span>ساعات الاستخدام اليومي</span>
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="range" 
                        min="0.1" 
                        max="24" 
                        step="0.1"
                        value={app.hoursPerDay}
                        onChange={(e) => onUpdateAppliance(app.id, { hoursPerDay: Number(e.target.value) })}
                        className="w-20 md:w-24 accent-amber-500 h-1 rounded-full bg-slate-100 cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-slate-800 w-10 text-center bg-slate-50 border border-slate-150 rounded-md py-0.5 px-1.5 shrink-0">
                        {app.hoursPerDay}س
                      </span>
                    </div>
                  </div>

                  {/* Quantity Adjust */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 justify-end">
                      <Layers className="w-3 h-3 text-slate-450" />
                      <span>العدد بالمنزل</span>
                    </span>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <button 
                        disabled={app.quantity <= 1}
                        onClick={() => onUpdateAppliance(app.id, { quantity: app.quantity - 1 })}
                        className="w-6 h-6 border border-slate-200 select-none cursor-pointer rounded-full flex items-center justify-center text-xs hover:bg-slate-50 disabled:opacity-30 text-slate-600 bg-white"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono text-slate-800 w-4 text-center">{app.quantity}</span>
                      <button 
                        onClick={() => onUpdateAppliance(app.id, { quantity: app.quantity + 1 })}
                        className="w-6 h-6 border border-slate-200 select-none cursor-pointer rounded-full flex items-center justify-center text-xs hover:bg-slate-50 text-slate-600 bg-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Calculated monthly KWh output */}
                  <div className="text-right sm:text-right min-w-[70px]">
                    <span className="text-[10px] text-slate-400 block font-medium">الاستهلاك الشهري</span>
                    <span className="text-xs font-bold font-mono text-indigo-650 mt-1 block">
                      {monthlyKWh} <span className="text-[9px] font-medium">ك.و.س</span>
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteAppliance(app.id)}
                    className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
