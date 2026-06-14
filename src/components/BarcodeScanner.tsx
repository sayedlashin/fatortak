/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, QrCode, Sparkles, BookOpen, Search, PlusCircle, Check, AlertTriangle, HelpCircle } from 'lucide-react';
import { Appliance, TYPICAL_EGYPTIAN_APPLIANCES, CATEGORY_METADATA } from '../types';

interface BarcodeScannerProps {
  onAddAppliance: (appliance: Omit<Appliance, 'id'>) => void;
}

export default function BarcodeScanner({ onAddAppliance }: BarcodeScannerProps) {
  const [useScanner, setUseScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedResult, setScannedResult] = useState<Omit<Appliance, 'id'> | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  
  // Custom manual state
  const [manualName, setManualName] = useState('');
  const [manualWatts, setManualWatts] = useState<number>(300);
  const [manualHours, setManualHours] = useState<number>(4);
  const [manualQty, setManualQty] = useState<number>(1);
  const [manualCategory, setManualCategory] = useState<Appliance['category']>('kitchen');
  const [successMsg, setSuccessMsg] = useState(false);

  // Simulated cameras and triggers
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleScanBarcode = (code: string) => {
    setScanning(true);
    setNotFoundBarcode(null);
    setScannedResult(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Simulate real quick scan decodification
    timeoutRef.current = setTimeout(() => {
      setScanning(false);
      const cleaned = code.trim();
      const match = TYPICAL_EGYPTIAN_APPLIANCES.find(d => d.barcode === cleaned);

      if (match) {
        setScannedResult(match);
      } else {
        setNotFoundBarcode(cleaned);
      }
    }, 1500);
  };

  const confirmAddScanned = () => {
    if (scannedResult) {
      onAddAppliance(scannedResult);
      setScannedResult(null);
      setManualBarcode('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || manualWatts <= 0) return;

    onAddAppliance({
      name: manualName,
      arabicName: manualName,
      watts: manualWatts,
      hoursPerDay: manualHours,
      quantity: manualQty,
      category: manualCategory,
      isCustom: true
    });

    // Reset Form
    setManualName('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div id="barcode-scanner-box" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8">
      {/* Simulation / Scanner Section */}
      <div className="flex-1 flex flex-col justify-start">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-600" />
          <span>إضافة الأجهزة بمسح الباركود</span>
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          وجّه الكاميرا إلى باركود الجهاز الكهربائي لتسجيله تلقائياً بقدرته الحقيقية، أو اختر رمزًا من الرموز المتاحة بالمنزل لمحاكاة العملية المبتكرة.
        </p>

        {/* Outer Scanner Wrapper */}
        <div className="relative aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-white border-2 border-slate-800 shadow-inner">
          {useScanner ? (
            scanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80">
                <div className="relative w-44 h-44 border-2 border-dashed border-emerald-500/80 rounded flex items-center justify-center animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400"></div>
                  {/* Glowing Laser line */}
                  <div className="absolute w-full h-[3px] bg-red-500 animate-bounce shadow-[0_0_10px_#ef4444]"></div>
                  <QrCode className="w-16 h-16 text-slate-400 animate-pulse" />
                </div>
                <p className="text-sm tracking-widest text-emerald-300 font-mono mt-4">جاري قراءة خطوط الباركود...</p>
              </div>
            ) : scannedResult ? (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center mb-3 text-emerald-300">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">تم المسح وتحديد الجهاز!</h3>
                <p className="text-xs text-emerald-300 font-mono mb-4">الباركود: {scannedResult.barcode}</p>

                <div className="bg-slate-900/60 p-4 rounded-xl max-w-sm mb-4 border border-emerald-500/35">
                  <p className="font-semibold text-white">{scannedResult.arabicName}</p>
                  <p className="text-xs text-slate-400 mt-1">القدرة: <span className="text-amber-400 font-bold">{scannedResult.watts} واط</span> | الاستهلاك المقترح: {scannedResult.hoursPerDay} ساعات/يوم</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={confirmAddScanned}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    إضافة جهاز للمنزل
                  </button>
                  <button 
                    onClick={() => { setScannedResult(null); setUseScanner(false); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    إعادة المسح
                  </button>
                </div>
              </div>
            ) : notFoundBarcode ? (
              <div className="absolute inset-0 bg-rose-950/95 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-rose-400 mb-3" />
                <h3 className="font-bold text-white text-md">عذراً، هذا الباركود غير مسجل لدينا</h3>
                <p className="text-xs text-rose-300 font-mono mt-1 mb-4">الرمز: {notFoundBarcode}</p>
                <p className="text-xs text-slate-300 max-w-xs mb-4 leading-relaxed">
                  الباركود جديد أو لعلامة تجارية مختلفة. يمكنك تسجيل الجهاز يدويًا بخاصية الإدخال المجاورة في دقيقة واحدة!
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setManualName(`جهاز باركود (${notFoundBarcode.slice(-4)})`);
                      setManualWatts(1000);
                      // focus on form
                      document.getElementById('manual-name-input')?.focus();
                      setNotFoundBarcode(null);
                    }}
                    className="bg-rose-700 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    الانتقال للإضافة اليدوية
                  </button>
                  <button 
                    onClick={() => { setNotFoundBarcode(null); setUseScanner(false); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              /* Scanning Ready Frame */
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-6">
                <Camera className="w-12 h-12 text-slate-500 mb-2 animate-bounce" />
                <p className="font-medium text-slate-300 mb-1 text-sm">وجّه كاميرا الهاتف لباركود الجهاز</p>
                <p className="text-xs text-slate-500 mb-4">(محاكاة المسح الرقمي الفوري الذكي)</p>
                
                {/* Manual Barcode Input inside the viewport */}
                <div className="flex items-center gap-2 max-w-sm w-full">
                  <input 
                    type="text" 
                    placeholder="أدخل الباركود يدوياً (مثال: 6221000200123)"
                    value={manualBarcode} 
                    onChange={e => setManualBarcode(e.target.value)}
                    className="flex-1 bg-slate-950 rounded-lg px-3 py-1.5 text-xs text-white border border-slate-800 focus:outline-none focus:border-emerald-600 font-mono text-center"
                    onKeyDown={e => e.key === 'Enter' && manualBarcode && handleScanBarcode(manualBarcode)}
                  />
                  <button 
                    onClick={() => handleScanBarcode(manualBarcode)}
                    disabled={!manualBarcode}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                  >
                    مسح
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Idle Screen - Pick from household catalog barcodes */
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
              <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
              <p className="font-semibold text-slate-200 text-sm mb-1">محاكي الباركود الذكي للأجهزة المنزلية</p>
              <p className="text-xs text-slate-400 mb-4 text-center max-w-md px-4">
                تطويراً للمسكن الذكي؛ قمنا بإجراء ربط للباركود بقاعدتنا المعرفية للأجهزة المصرية. اضغط على أي جهاز لمحاكاة المسح التلقائي السريع:
              </p>

              <div className="grid grid-cols-2 gap-2 w-full max-w-md max-h-36 overflow-y-auto mb-4 p-1 custom-scrollbar text-left font-sans">
                {TYPICAL_EGYPTIAN_APPLIANCES.filter(d => d.barcode).slice(0, 6).map((app, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUseScanner(true);
                      handleScanBarcode(app.barcode || '');
                    }}
                    className="bg-slate-900 hover:bg-slate-850 hover:border-emerald-600 border border-slate-800 p-2 rounded-lg text-right transition-all flex items-center justify-between"
                  >
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded-sm font-mono">{app.barcode?.slice(-5)}</span>
                    <span className="text-xs text-slate-300 font-medium truncate ml-1">{app.arabicName}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setUseScanner(true)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs px-4 py-2 rounded-full border border-slate-700 font-medium transition-all"
              >
                مسح باركود برمز مخصص
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Form */}
      <div className="flex-1 shrink-0 border-r md:border-r-0 md:border-t-0 md:pt-0 pt-6 border-slate-100 flex flex-col justify-start md:pl-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-amber-600" />
          <span>إضافة يدوية للأجهزة</span>
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          هل الباركود غير مسجل؟ لا تقلق، أدخل مواصفات جهازك (القدرة الكهربية بالوات وساعات التشغيل باليوم) لحسابها فوراً في الفاتورة.
        </p>

        <form onSubmit={handleManualAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="manual-name-input" className="block text-xs font-semibold text-slate-600 mb-1.5">اسم الجهاز الكهربائي</label>
              <input 
                id="manual-name-input"
                type="text" 
                required
                placeholder="مثلاً: تكييف الصالة، تلفاز غرفة النوم، غلاية.."
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 tracking-tight focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="manual-watts-input" className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1 justify-between">
                <span>القدرة بالوات (Watt)</span>
                <span className="text-[10px] text-amber-600 underline cursor-pointer" onClick={() => setManualWatts(1500)}>مثال السخان: 1500w</span>
              </label>
              <input 
                id="manual-watts-input"
                type="number" 
                required
                min="1"
                max="10000"
                placeholder="مثال: 1200"
                value={manualWatts || ''}
                onChange={e => setManualWatts(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="manual-hours-input" className="block text-xs font-semibold text-slate-600 mb-1.5">ساعات التشغيل اليومي</label>
              <input 
                id="manual-hours-input"
                type="number" 
                required
                min="0.1"
                max="24"
                step="0.1"
                placeholder="مثال: 5"
                value={manualHours || ''}
                onChange={e => setManualHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="manual-qty-input" className="block text-xs font-semibold text-slate-600 mb-1.5">الكمية بالمنزل</label>
              <input 
                id="manual-qty-input"
                type="number" 
                required
                min="1"
                max="50"
                placeholder="مثال: 1"
                value={manualQty || ''}
                onChange={e => setManualQty(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="manual-cat-input" className="block text-xs font-semibold text-slate-600 mb-1.5">فئة الاستخدام</label>
              <select 
                id="manual-cat-input"
                value={manualCategory}
                onChange={e => setManualCategory(e.target.value as Appliance['category'])}
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none transition-colors font-medium cursor-pointer"
              >
                {Object.entries(CATEGORY_METADATA).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-sm shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل وإضافة الجهاز</span>
          </button>

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-3 rounded-xl flex items-center justify-center gap-2 text-xs">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>جاري حفظ وتحميل الاستهلاك للفاتورة الحالية بنجاح!</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
