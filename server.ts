import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined. AI Advisor functionality will run in local simulation mode.");
}

// API endpoint for smart electricity advisor
app.post("/api/advisor", async (req, res) => {
  try {
    const { appliances, userQuestion } = req.body;

    if (!appliances || !Array.isArray(appliances)) {
      return res.status(400).json({ error: "Invalid appliances data" });
    }

    if (!ai) {
      // Local simulated response if GEMINI_API_KEY is missing
      return res.json({
        advice: "⚠️ (وضع المحاكاة: لم يتم تكوين مفتاح API لجيميني)\n\n" +
          "بناءً على قائمة أجهزتك، إليك نصائح الترشيد المقترحة:\n" +
          "1. السخانات والتكييفات تمثلان الأثر الأكبر على فاتورتك. تأكد من ضبط التكييف عند 24 درجة مئوية.\n" +
          "2. افصل شواحن الهواتف والأجهزة الإلكترونية الأخرى من المقابس في حال عدم استخدامها لمنع الاستهلاك الساكن.\n" +
          "3. يمكنك خفض زمن تشغيل سخان المياه إلى 30 دقيقة فقط قبل الاستخدام بدلاً من تركه يعمل طوال اليوم.\n" +
          "4. استبدل اللمبات العادية بلمبات ليد موفرة دائمًا.",
        insights: [
          "احرص على مراقبة وتيرة تشغيل التكييفات والسخانات.",
          "تجاوز استهلاك 100 كيلووات يرفع محاسبة كامل الاستهلاك للشريحة الثالثة.",
          "تأتي الإضاءة والأجهزة الخفيفة في ذيل قائمة الاستهلاك، ولكن السلوك التراكمي مهم."
        ]
      });
    }

    // Prepare prompt
    const applianceSummaries = appliances.map((app: any) => 
      `- ${app.arabicName || app.name}: القدرة ${app.watts} واط، وقت التشغيل ${app.hoursPerDay} ساعة/يوم، العدد: ${app.quantity} (الفئة: ${app.category})`
    ).join("\n");

    const systemPrompt = `أنت خبير ذكي ومحترف ومستشار متخصص في قطاع ترشيد الطاقة والكهرباء في مصر. مهمتك هي تقديم مشورة ذكية، بلغة عربية سلسلة، واضحة ومبسطة، وموجهة خصيصاً للمواطن المصري.
سياق الفاتورة في مصر:
- يتم احتساب الفاتورة بنظام الشرائح التصاعدية (7 شرائح).
- الشريحة 1 (0-50 ك.و.س) بسعر 68 قرش. الشريحة 2 (51-100 ك.و.س) بسعر 78 قرش. تخطي 100 ك.و.س ينقل العميل بالكامل للشريحة 3 بسعر 95 قرش للكل من الصفر.
- الشريحة 4 (201-350 ك.و.س) بسعر 1.55 جنيه، الشريحة 5 (351-650 ك.و.س) بسعر 1.95 جنيه. تخطي 650 ك.و.س يلغي السابقة ويحسب الكل من الصفر بـ 2.10 جنيه (الشريحة 6).
- تخطي 1000 ك.و.س يحسب من الصفر بـ 2.23 جنيه (الشريحة 7).

المعلومات الواردة من المستخدم هي قائمة بأجهزته الكهربائية في المنزل وتفاصيل تشغيلها.
قم بتحليل الأجهزة وتحديد الأجهزة الأكثر استهلاكًا (Pain points)، وتقديم خطة عملية مخصصة بمقدار التوفير المتوقع بالجنيه المصري، وحلول بديلة ذكية ومبتكرة.
إذا طرح المستخدم سؤالاً معيناً، أجب عليه بقوة وحلول علمية عملية في نهاية الاستشارة.`;

    const prompt = `حلل قائمة الأجهزة المنزلية التالية وقدم إستراتيجية توفير طاقة ذكية ومخصصة:
الأجهزة الحالية بالمنزل:
${applianceSummaries}

${userQuestion ? `سؤال المستخدم الإضافي: ${userQuestion}` : ""}

يرجى صياغة تقريرك باحترافية، وتضمين النصائح في شكل بنود، مع الإشارة صراحة لاسم الجهاز الأكثر استهلاكًا ونصيحته المحددة بالجنيه المصري وتوضيح كيف تؤثر قفزات الشرائح على ميزانيته.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      advice: response.text,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate advice inside backend", details: error.message });
  }
});

// Start server
async function startServer() {
  const PORT = 3000;

  // Integrate Vite dynamically in development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full stack server", err);
});
