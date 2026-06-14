/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EGYPT_TARIFF_TIERS, BillCalculationResult, EGYPT_TARIFF_TIERS as TIERS } from '../types';
import { BookOpen, AlertTriangle, CheckCircle2, ChevronRight, Calculator, HelpCircle, ArrowUpRight } from 'lucide-react';

interface TariffGuideProps {
  calculation: BillCalculationResult;
}

export default function TariffGuide({ calculation }: TariffGuideProps) {
  const { totalKWhPerMonth, totalCostEGP, electricityCostEGP, serviceFeeEGP, currentTierId, tierBreakdown, lossDetails } = calculation;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>دليل شرائح الكهرباء في مصر (المعتمد)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">فئات أسعار الكهرباء للاستهلاك المنزلي وكيفية احتساب قيمة الفاتورة</p>
        </div>
      </div>

      {/* Bill Jump Penalities Alerts - SMART ALERT SYSTEM */}
      {lossDetails && (
        <div className="bg-rose-50 border border-rose-150 rounded-2xl p-4 text-rose-950 mb-6 flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-right">
            <h3 className="font-bold text-sm text-rose-950">نظام التنبيهات الذكي: تم رصد زيادة فجائية قدرها {lossDetails.addedCost} جنيه!</h3>
            <p className="text-xs text-rose-800 mt-1.5 leading-relaxed">
              {lossDetails.advice}
            </p>
            <div className="mt-3 flex gap-4">
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded font-bold">
                الاستهلاك الحالي: {totalKWhPerMonth} ك.و.س
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">
                الحد الآمن الأقرب: {lossDetails.safeKWhLimit} ك.و.س
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progressive Step by Step Calculation Formula */}
      <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200/50 mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5 flex items-center gap-1">
          <Calculator className="w-4 h-4 text-indigo-600" />
          <span>تفكيك حساب فاتورتك بالتفصيل:</span>
        </h3>

        {totalKWhPerMonth === 0 ? (
          <p className="text-xs text-slate-400">القائمة فارغة. الحساب الإجمالي يظهر فور تسجيل بعض الأجهزة.</p>
        ) : (
          <div className="space-y-3 font-sans">
            {/* Display each step of the calculation based on breakdown */}
            {tierBreakdown.map((breakNode, index) => (
              <div key={index} className="flex items-center justify-between text-xs text-slate-700 border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-medium">{breakNode.tierName}</span>
                  <span className="text-slate-400">({breakNode.kWhInTier} ك.و.س × {breakNode.rate} جنيه/ك.و.س)</span>
                </span>
                <span className="font-semibold font-mono text-slate-800">{breakNode.cost.toFixed(2)} جنيه</span>
              </div>
            ))}

            {/* Service Fees */}
            <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>مقابل خدمة العملاء (للشريحة {currentTierId})</span>
              </span>
              <span className="font-semibold font-mono text-slate-800">{serviceFeeEGP} جنيه</span>
            </div>

            {/* Final Sum calculation */}
            <div className="flex items-center justify-between text-sm font-bold text-slate-850 pt-1.5">
              <span>القيمة الإجمالية الصافية للكهرباء</span>
              <span className="text-emerald-700 font-mono font-bold text-base">{totalCostEGP.toFixed(2)} جنيه مصري</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid List of All 7 Approved Slabs */}
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
        <span>قائمة أسعار شرائح الكهرباء المصرية (2024/2025):</span>
      </h3>

      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {TIERS.map((tier) => {
          const isUserCurrentTier = tier.id === currentTierId && totalKWhPerMonth > 0;
          
          return (
            <div 
              key={tier.id}
              className={`border rounded-2xl p-3.5 transition-all flex flex-col sm:flex-row hover:border-slate-310 items-start sm:items-center justify-between gap-3 ${
                isUserCurrentTier 
                  ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300' 
                  : 'bg-white border-slate-150'
              }`}
            >
              <div className="flex items-start gap-2.5 flex-1 text-right">
                {isUserCurrentTier ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 shrink-0 mt-0.5">
                    {tier.id}
                  </div>
                )}
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-start">
                    <h4 className="font-bold text-slate-800 text-xs">{tier.name}</h4>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {tier.range}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">{tier.description}</p>
                </div>
              </div>

              {/* Rates column */}
              <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium ml-1 block">سعر التكلفة:</span>
                <span className={`font-mono font-bold text-sm ${isUserCurrentTier ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {tier.rate.toFixed(2)} <span className="text-[10px] font-medium font-sans">جنيه/ك.و.س</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5 sm:block hidden">م. خدمة العملاء: {tier.customerServiceFee}ج</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
