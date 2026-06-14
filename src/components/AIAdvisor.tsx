/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Appliance, CATEGORY_METADATA } from '../types';
import { Sparkles, Brain, Send, Loader2, Lightbulb, CheckCircle, Info, MessageSquare, ShieldAlert } from 'lucide-react';

interface AIAdvisorProps {
  appliances: Appliance[];
}

export default function AIAdvisor({ appliances }: AIAdvisorProps) {
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Daily Tips Catalog
  const STATIC_TIPS = [
    {
      category: "cooling",
      title: "ترشيد مكيفات الهواء",
      points: [
        "اضبط درجة حرارة التكييف دائماً عند 24 درجة مئوية؛ النزول درجتين يرفع الاستهلاك 20% بدون طائل.",
        "احرص على غسل وتنظيف الفلاتر الهوائية للمكيف شهرياً لتحسين جودة التبريد وخفض المجهود الكهربائي.",
        "أحكم غلق النوافذ والأبواب وعزل الغرفة تماماً بالستائر عند بدء تشغيل التكييف."
      ]
    },
    {
      category: "heating",
      title: "ترشيد السخان الغلايات",
      points: [
        "شغل سخان المياه الكهربائي قبل الاستخدام بنصف ساعة فقط وبدرجة 50-60 مئوية كحد أقصى، ولا تتركه يعمل طوال اليوم.",
        "افصل سخان المياه طيلة فصل الصيف واعتمد على المياه الفاترة الطبيعية.",
        "املأ غلاية المياه (الكاتل) بالقدر الذي تحتاجه لشرب الشاي بدقة وتفادى غلي مياه فائضة."
      ]
    },
    {
      category: "kitchen",
      title: "أجهزة الطهي والثلاجات",
      points: [
        "تفادى تماماً ترك باب الثلاجة مفتوحاً لفترات طويلة لمنع تسرب مركب الفريون ودخول الحرارة.",
        "اترك الأطعمة الساخنة تبرد تماماً بالخارج قبل وضعها داخل الثلاجة حتى لا تبذل مجهود مضاغف للتبريد.",
        "استبدل الأفران الكهربائية الكبرى بالمايكروويف لإعادة تسخين الأطعمة السريعة لتوفير 50% من الجهد."
      ]
    },
    {
      category: "standby",
      title: "الاستهلاك الساكن (مصاصو الطاقة)",
      points: [
        "افصل شواحن الهواتف، التلفزيونات، والإنترنت واللاب توب تماماً من المقابس قبل الخلود للنوم.",
        "تعطيل وضع الاستعداد (Standby) لجميع الأجهزة يوفر ما يقرب من 5٪ إلى 10٪ من إجمالي فاتورة الكهرباء شهرياً."
      ]
    }
  ];

  const handleFetchAIAdvice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (appliances.length === 0) {
      setErrorMsg("الرجاء إضافة بعض الأجهزة وساعات العمل أولاً ليقوم الذكاء الاصطناعي بتحليلها.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          appliances: appliances,
          userQuestion: userQuery
        })
      });

      if (!res.ok) {
        throw new Error("حدث خطأ أثناء الاتصال بالخادم. الرجاء المحاولة مجدداً.");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiReport(data.advice);
      setUserQuery(''); // Clean input
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "فشل الاتصال بمستشار الذكاء الاصطناعي.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse text lines to visually structured paragraphs/bullet items in React without dangerouslySetInnerHTML
  const renderTextContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2.5" />;
      
      // Check if line is a major heading
      if (trimmed.startsWith('###') || trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 100) {
        const cleanHeading = trimmed.replace(/[#\*]+/g, '').trim();
        return <h4 key={idx} className="text-sm font-bold text-indigo-900 mt-4 mb-2 border-r-2 border-indigo-500 pr-2">{cleanHeading}</h4>;
      }
      
      // Check if line is bullet point
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        const cleanBullet = trimmed.replace(/^[\-\*\d\.\s]+/g, '').trim();
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed mb-1.5 mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
            <span>{cleanBullet}</span>
          </div>
        );
      }

      // Default paragraph (applying bold internally where applicable)
      return <p key={idx} className="text-xs text-slate-600 leading-relaxed mb-2">{trimmed}</p>;
    });
  };

  return (
    <div id="ai-advisor-pane" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span>مستشار الطاقة الذكي وجيميني ميزانك</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">توليد تقارير وخطة وفر بالجنيه المصري مدعمة بنظام ذكاء اصطناعي</p>
          </div>
        </div>

        {/* GEMINI AI SOLICITATION BOX */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-150 mb-6">
          <div className="flex items-start gap-3 text-right">
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-lg shadow-indigo-600/10">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-indigo-950">مستشار الطاقة بجيميني (Gemini AI Expert)</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                اضغط على الزر أدناه ليقوم نموذج <strong className="text-indigo-800 font-mono">Gemini 3.5 Flash</strong> بقراءة قائمة أجهزتك الحقيقية لتقديم تقرير عجز وفر مفصل ومخصص لأولويات ميزانيتك.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {/* Custom Input Field for Ask Gemini */}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="اسأل مستشار الطاقة مثلاً: 'هل تكييف ١.٥ يستهلك أكثر من سخان مياه؟'"
                value={userQuery}
                onKeyDown={e => e.key === 'Enter' && handleFetchAIAdvice()}
                onChange={e => setUserQuery(e.target.value)}
                className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleFetchAIAdvice()}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>استشارة</span>
              </button>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 justify-end">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                <span>{errorMsg}</span>
              </p>
            )}

            {!aiReport && !loading && (
              <button
                onClick={() => handleFetchAIAdvice()}
                className="bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>تحليل قائمة أجهزتي الحالية وتوليد تقرير الترشيد</span>
              </button>
            )}
          </div>

          {/* AI Result Container */}
          {loading && (
            <div className="mt-4 bg-white rounded-xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center py-10">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3 stroke-[2.5]" />
              <p className="text-xs font-semibold text-slate-700">جاري فحص قائمة الأجهزة وقياس فئات الشرائح المعتمدة...</p>
              <p className="text-[10px] text-slate-400 mt-1.5">الذكاء الاصطناعي يقوم بصياغة حزمة الاستشارة والتوفير بالجنيه المصري</p>
            </div>
          )}

          {aiReport && !loading && (
            <div className="mt-4 bg-white rounded-xl p-5 border border-indigo-100 shadow-sm max-h-[350px] overflow-y-auto">
              <div className="flex items-center gap-1.5 mb-3 border-b border-slate-100 pb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">تقرير وتوصيات مستشار الطاقة:</span>
              </div>
              <div className="text-right">
                {renderTextContent(aiReport)}
              </div>
              <button 
                onClick={() => setAiReport(null)}
                className="mt-4 text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>إعادة التحليل والمقاصة</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QUICK OFFLINE STATIC REFERENCE DAILY TIPS */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>نصائح الترشيد لمختلف فئات الاستخدام اليومي:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATIC_TIPS.map((tip, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2.5 text-right justify-start">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <h4 className="font-bold text-slate-800 text-xs">{tip.title}</h4>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 pr-1 list-none">
                {tip.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-1 justify-start">
                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0 ml-1.5" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
