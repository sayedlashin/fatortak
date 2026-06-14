/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Appliance {
  id: string;
  name: string;
  arabicName: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
  category: 'cooling' | 'heating' | 'kitchen' | 'laundry' | 'entertainment' | 'lighting' | 'other';
  barcode?: string;
  isCustom?: boolean;
}

export interface TariffTier {
  id: number;
  name: string;
  range: string;
  rate: number; // in EGP per kWh
  isProgressive: boolean; // if false, bills from zero if entered
  description: string;
  customerServiceFee: number; // in EGP
}

// Egyptian Electricity Slabs 2024/2025
export const EGYPT_TARIFF_TIERS: TariffTier[] = [
  {
    id: 1,
    name: "الشريحة الأولى",
    range: "من 0 إلى 50 كيلووات",
    rate: 0.68,
    isProgressive: true,
    description: "للاستهلاكات البسيطة للغاية. مدعومة بالكامل.",
    customerServiceFee: 1
  },
  {
    id: 2,
    name: "الشريحة الثانية",
    range: "من 51 إلى 100 كيلووات",
    rate: 0.78,
    isProgressive: true,
    description: "للاستهلاك المنزلي المحدود.",
    customerServiceFee: 2
  },
  {
    id: 3,
    name: "الشريحة الثالثة",
    range: "من 0 إلى 200 كيلووات",
    rate: 0.95,
    isProgressive: false, // reset calculation from 0 under this rate if total exceeds 100 kWh
    description: "تبدأ من الصفر إذا تجاوز الاستهلاك الإجمالي 100 كيلووات وحتى 200 كيلووات.",
    customerServiceFee: 6
  },
  {
    id: 4,
    name: "الشريحة الرابعة",
    range: "من 201 إلى 350 كيلووات",
    rate: 1.55,
    isProgressive: true,
    description: "للاستهلاك المتوسط فوق 200 كيلووات.",
    customerServiceFee: 11
  },
  {
    id: 5,
    name: "الشريحة الخامسة",
    range: "من 351 إلى 650 كيلووات",
    rate: 1.95,
    isProgressive: true,
    description: "للاستهلاك المرتفع نسبيًا.",
    customerServiceFee: 15
  },
  {
    id: 6,
    name: "الشريحة السادسة",
    range: "من 0 إلى 1000 كيلووات",
    rate: 2.10,
    isProgressive: false, // Reset calculation from 0 if exceeds 650
    description: "تبدأ من الصفر إذا تجاوز الاستهلاك الإجمالي 650 كيلووات وحتى 1000 كيلووات.",
    customerServiceFee: 25
  },
  {
    id: 7,
    name: "الشريحة السابعة",
    range: "أكثر من 1000 كيلووات",
    rate: 2.23,
    isProgressive: false, // Reset calculation from 0 if exceeds 1000
    description: "تبدأ من الصفر إذا تجاوز الاستهلاك 1000 كيلووات شهرياً ولا يحصل على أي دعم وبأعلى سعر.",
    customerServiceFee: 40
  }
];

export interface BillCalculationResult {
  totalKWhPerMonth: number;
  totalCostEGP: number;
  electricityCostEGP: number;
  serviceFeeEGP: number;
  currentTierId: number;
  tierBreakdown: {
    tierId: number;
    tierName: string;
    kWhInTier: number;
    rate: number;
    cost: number;
  }[];
  lossDetails?: {
    cause: 'tier_jump_100' | 'tier_jump_650' | 'tier_jump_1000';
    addedCost: number;
    advice: string;
    safeKWhLimit: number;
  };
}

/**
 * Calculates the Egyptian residential electricity bill progressiveness.
 * @param totalKWhPerMonth Total kilowatt-hours consumed in a month
 */
export function calculateEgyptianBill(totalKWhPerMonth: number): BillCalculationResult {
  let electricityCost = 0;
  let serviceFee = 0;
  let currentTierId = 1;
  const breakdown: BillCalculationResult['tierBreakdown'] = [];
  let lossDetails: BillCalculationResult['lossDetails'] | undefined = undefined;

  // Round to 2 decimal places
  const total = Math.round(totalKWhPerMonth * 100) / 100;

  if (total <= 50) {
    currentTierId = 1;
    serviceFee = EGYPT_TARIFF_TIERS[0].customerServiceFee;
    const cost = total * EGYPT_TARIFF_TIERS[0].rate;
    electricityCost = cost;
    breakdown.push({
      tierId: 1,
      tierName: EGYPT_TARIFF_TIERS[0].name,
      kWhInTier: total,
      rate: EGYPT_TARIFF_TIERS[0].rate,
      cost: cost
    });
  } else if (total <= 100) {
    currentTierId = 2;
    serviceFee = EGYPT_TARIFF_TIERS[1].customerServiceFee;
    
    // First 50 kWh @ 0.68
    const cost1 = 50 * EGYPT_TARIFF_TIERS[0].rate;
    const remKWh = total - 50;
    const cost2 = remKWh * EGYPT_TARIFF_TIERS[1].rate;
    electricityCost = cost1 + cost2;

    breakdown.push({
      tierId: 1,
      tierName: EGYPT_TARIFF_TIERS[0].name,
      kWhInTier: 50,
      rate: EGYPT_TARIFF_TIERS[0].rate,
      cost: cost1
    });
    breakdown.push({
      tierId: 2,
      tierName: EGYPT_TARIFF_TIERS[1].name,
      kWhInTier: remKWh,
      rate: EGYPT_TARIFF_TIERS[1].rate,
      cost: cost2
    });
  } else if (total <= 200) {
    currentTierId = 3;
    serviceFee = EGYPT_TARIFF_TIERS[2].customerServiceFee;
    
    // reset from zero, billed entirely at Shariha 3 (0.95)
    electricityCost = total * EGYPT_TARIFF_TIERS[2].rate;
    
    breakdown.push({
      tierId: 3,
      tierName: EGYPT_TARIFF_TIERS[2].name,
      kWhInTier: total,
      rate: EGYPT_TARIFF_TIERS[2].rate,
      cost: electricityCost
    });

    // Alert about tier jump from 100 kWh
    const costIfLessThanOrEqualTo100 = (50 * EGYPT_TARIFF_TIERS[0].rate) + (50 * EGYPT_TARIFF_TIERS[1].rate); // 73 EGP
    const costAt101 = 101 * EGYPT_TARIFF_TIERS[2].rate; // 95.95 EGP
    const jumpPenalty = costAt101 - costIfLessThanOrEqualTo100;
    lossDetails = {
      cause: 'tier_jump_100',
      addedCost: Math.round(jumpPenalty * 100) / 100,
      advice: "تخطيت حاجز الـ 100 كيلووات! مما أدى لإلغاء الشريحة الأولى والثانية ومحاسبتك بالكامل على الشريحة الثالثة (95 قرش) لجميع الكيلووات من الصفر. ننصحك بترشيد استهلاكك لتظل تحت 100 ك.و.س لتوفير مبالغ كبيرة.",
      safeKWhLimit: 100
    };
  } else if (total <= 350) {
    currentTierId = 4;
    serviceFee = EGYPT_TARIFF_TIERS[3].customerServiceFee;

    // First 200 kWh at Shariha 3 (0.95), rest at Shariha 4 (1.55)
    const cost3 = 200 * EGYPT_TARIFF_TIERS[2].rate;
    const remKWh = total - 200;
    const cost4 = remKWh * EGYPT_TARIFF_TIERS[3].rate;
    electricityCost = cost3 + cost4;

    breakdown.push({
      tierId: 3,
      tierName: EGYPT_TARIFF_TIERS[2].name,
      kWhInTier: 200,
      rate: EGYPT_TARIFF_TIERS[2].rate,
      cost: cost3
    });
    breakdown.push({
      tierId: 4,
      tierName: EGYPT_TARIFF_TIERS[3].name,
      kWhInTier: remKWh,
      rate: EGYPT_TARIFF_TIERS[3].rate,
      cost: cost4
    });
  } else if (total <= 650) {
    currentTierId = 5;
    serviceFee = EGYPT_TARIFF_TIERS[4].customerServiceFee;

    // 200 kWh at 0.95, 150 kWh at 1.55, rest at 1.95
    const cost3 = 200 * EGYPT_TARIFF_TIERS[2].rate; // 190
    const cost4 = 150 * EGYPT_TARIFF_TIERS[3].rate; // 232.5
    const remKWh = total - 350;
    const cost5 = remKWh * EGYPT_TARIFF_TIERS[4].rate;
    electricityCost = cost3 + cost4 + cost5;

    breakdown.push({
      tierId: 3,
      tierName: "الشريحة الثالثة (أول 200 ك.و.س)",
      kWhInTier: 200,
      rate: EGYPT_TARIFF_TIERS[2].rate,
      cost: cost3
    });
    breakdown.push({
      tierId: 4,
      tierName: "الشريحة الرابعة (التالي 150 ك.و.س)",
      kWhInTier: 150,
      rate: EGYPT_TARIFF_TIERS[3].rate,
      cost: cost4
    });
    breakdown.push({
      tierId: 5,
      tierName: EGYPT_TARIFF_TIERS[4].name,
      kWhInTier: remKWh,
      rate: EGYPT_TARIFF_TIERS[4].rate,
      cost: cost5
    });
  } else if (total <= 1000) {
    currentTierId = 6;
    serviceFee = EGYPT_TARIFF_TIERS[5].customerServiceFee;

    // Reset from zero, billed entirely at 2.10 EGP
    electricityCost = total * EGYPT_TARIFF_TIERS[5].rate;

    breakdown.push({
      tierId: 6,
      tierName: EGYPT_TARIFF_TIERS[5].name,
      kWhInTier: total,
      rate: EGYPT_TARIFF_TIERS[5].rate,
      cost: electricityCost
    });

    const costAt650 = (200 * EGYPT_TARIFF_TIERS[2].rate) + (150 * EGYPT_TARIFF_TIERS[3].rate) + (300 * EGYPT_TARIFF_TIERS[4].rate); // 1007.5 EGP
    const costAt651 = 651 * EGYPT_TARIFF_TIERS[5].rate; // 1367.1 EGP
    const jumpPenalty = costAt651 - costAt650;
    lossDetails = {
      cause: 'tier_jump_650',
      addedCost: Math.round(jumpPenalty * 100) / 100,
      advice: "تخطيت الاستهلاك فوق 650 ك.و.س! هذا أحدث قفزة هائلة في الفاتورة حيث ألغيت محاسبة الشرائح السابقة وحُوسبت بالكامل من الكيلووات الأول بسعر الشريحة السادسة (2.10 جنيه). احرص على عدم تخطي استهلاكك 650 ك.و.س لتتحكم بفاتورتك.",
      safeKWhLimit: 650
    };
  } else {
    currentTierId = 7;
    serviceFee = EGYPT_TARIFF_TIERS[6].customerServiceFee;

    // Reset from zero, billed entirely at 2.23 EGP
    electricityCost = total * EGYPT_TARIFF_TIERS[6].rate;

    breakdown.push({
      tierId: 7,
      tierName: EGYPT_TARIFF_TIERS[6].name,
      kWhInTier: total,
      rate: EGYPT_TARIFF_TIERS[6].rate,
      cost: electricityCost
    });

    const costAt1000 = 1000 * EGYPT_TARIFF_TIERS[5].rate; // 2100 EGP
    const costAt1001 = 1001 * EGYPT_TARIFF_TIERS[6].rate; // 2232.23 EGP
    const jumpPenalty = costAt1001 - costAt1000;
    lossDetails = {
      cause: 'tier_jump_1000',
      addedCost: Math.round(jumpPenalty * 100) / 100,
      advice: "دخلت الشريحة السابعة الكثيفة لأكثر من 1000 ك.و.س! هنا يتم محاسبة كامل استهلاكك بسعر ثابت 2.23 جنيه لكل ك.و.س وبدون أي دعم. ينبغي فحص الأجهزة الأكثر استهلاكًا مثل التكييفات والسخانات فورًا لتقليل هذا الفاقد المالي الباهظ.",
      safeKWhLimit: 1000
    };
  }

  const roundedElectricityCost = Math.round(electricityCost * 100) / 100;
  const totalCost = roundedElectricityCost + serviceFee;

  return {
    totalKWhPerMonth: total,
    totalCostEGP: Math.round(totalCost * 100) / 100,
    electricityCostEGP: roundedElectricityCost,
    serviceFeeEGP: serviceFee,
    currentTierId,
    tierBreakdown: breakdown,
    lossDetails
  };
}

// Preset Household Devices
export const TYPICAL_EGYPTIAN_APPLIANCES: Omit<Appliance, 'id'>[] = [
  { name: "Air Conditioner (1.5 HP)", arabicName: "تكييف هواء (1.5 حصان)", watts: 1200, category: 'cooling', hoursPerDay: 8, quantity: 1, barcode: "6221000200123" },
  { name: "Air Conditioner (2.25 HP)", arabicName: "تكييف هواء (2.25 حصان)", watts: 1800, category: 'cooling', hoursPerDay: 6, quantity: 1, barcode: "6221000200456" },
  { name: "Electric Water Heater", arabicName: "سخان مياه كهربائي", watts: 1500, category: 'heating', hoursPerDay: 3, quantity: 1, barcode: "6221000300111" },
  { name: "Electric Oven", arabicName: "فرن كهربائي كبير", watts: 2000, category: 'kitchen', hoursPerDay: 1, quantity: 1, barcode: "6221000400222" },
  { name: "Microwave Oven", arabicName: "ميكروويف", watts: 1200, category: 'kitchen', hoursPerDay: 0.5, quantity: 1, barcode: "6221000400333" },
  { name: "Electric Kettle", arabicName: "غلاية مياه (كاتل)", watts: 1500, category: 'kitchen', hoursPerDay: 0.75, quantity: 1, barcode: "6221000400444" },
  { name: "Automatic Washing Machine", arabicName: "غسالة ملابس أوتوماتيك", watts: 600, category: 'laundry', hoursPerDay: 2, quantity: 1, barcode: "6221000500555" },
  { name: "Dishwasher", arabicName: "غسالة أطباق", watts: 1200, category: 'kitchen', hoursPerDay: 1.5, quantity: 1, barcode: "6221000500666" },
  { name: "Refrigerator", arabicName: "ثلاجة منزلية بابين", watts: 250, category: 'cooling', hoursPerDay: 24, quantity: 1, barcode: "6221000600123" },
  { name: "Deep Freezer", arabicName: "ديب فريزر", watts: 200, category: 'cooling', hoursPerDay: 24, quantity: 1, barcode: "6221000600777" },
  { name: "Dryer", arabicName: "مجفف ملابس (دراير)", watts: 2500, category: 'laundry', hoursPerDay: 1, quantity: 1, barcode: "6221000500888" },
  { name: "Iron", arabicName: "مكواة ملابس", watts: 1000, category: 'heating', hoursPerDay: 1, quantity: 1, barcode: "6221000300321" },
  { name: "Vacuum Cleaner", arabicName: "مكنسة كهربائية", watts: 1600, category: 'other', hoursPerDay: 0.5, quantity: 1, barcode: "6221000700888" },
  { name: "Television (LED 43\")", arabicName: "شاشة تلفزيون (43 بوصة)", watts: 80, category: 'entertainment', hoursPerDay: 6, quantity: 1, barcode: "6221000800111" },
  { name: "Desktop Computer", arabicName: "جهاز كمبيوتر مكتبي", watts: 250, category: 'entertainment', hoursPerDay: 4, quantity: 1, barcode: "6221000800222" },
  { name: "LED Light Bulb (9W)", arabicName: "لمبة ليد موفرة (9 وات)", watts: 9, category: 'lighting', hoursPerDay: 8, quantity: 10, barcode: "6221000900111" },
  { name: "LED Light Bulb (15W)", arabicName: "لمبة ليد موفرة (15 وات)", watts: 15, category: 'lighting', hoursPerDay: 6, quantity: 5, barcode: "6221000900222" },
  { name: "Ceiling Fan", arabicName: "مروحة سقف", watts: 75, category: 'cooling', hoursPerDay: 10, quantity: 3, barcode: "6221000200888" }
];

export const CATEGORY_METADATA = {
  cooling: { label: "التبريد والتهوية", color: "bg-teal-500", border: 'border-teal-500', text: "text-teal-600", icon: "Wind" },
  heating: { label: "التدفئة والتسخين", color: "bg-orange-500", border: 'border-orange-500', text: "text-orange-600", icon: "Thermometer" },
  kitchen: { label: "أجهزة المطبخ", color: "bg-amber-500", border: 'border-amber-500', text: "text-amber-600", icon: "ChefHat" },
  laundry: { label: "الغسيل والتنظيف", color: "bg-blue-500", border: 'border-blue-500', text: "text-blue-600", icon: "Shirt" },
  entertainment: { label: "الترفيه والإلكترونيات", color: "bg-purple-500", border: 'border-purple-500', text: "text-purple-600", icon: "Tv2" },
  lighting: { label: "الإضاءة والإنارة", color: "bg-yellow-500", border: 'border-yellow-500', text: "text-yellow-600", icon: "Lightbulb" },
  other: { label: "أجهزة أخرى", color: "bg-slate-500", border: 'border-slate-500', text: "text-slate-600", icon: "Plug" }
};
