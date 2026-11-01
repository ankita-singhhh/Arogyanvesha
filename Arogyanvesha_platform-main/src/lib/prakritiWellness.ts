import type { Dosha } from "@/types";

export type WellnessCard = {
  id: "food" | "lifestyle" | "yoga" | "sleep" | "guidance";
  title: string;
  shortDescription: string;
  icon: string;
  focusArea: string;
  sections: {
    heading: string;
    items: string[];
  }[];
  details: string[]; // for backward compatibility
};

type DoshaKey = Dosha | "vata-pitta" | "pitta-vata" | "pitta-kapha" | "kapha-pitta" | "vata-kapha" | "kapha-vata" | "tridosha";

function normalizeDoshaKey(primary: Dosha, secondary?: Dosha | null): { key: DoshaKey; label: string } {
  const p = primary?.toLowerCase() as Dosha;
  const s = secondary?.toLowerCase() as Dosha | undefined | null;

  if (s && s !== p) {
    const pair = `${p}-${s}` as DoshaKey;
    const label = `${p.charAt(0).toUpperCase() + p.slice(1)}-${s.charAt(0).toUpperCase() + s.slice(1)}`;
    return { key: pair, label };
  }
  const label = p ? p.charAt(0).toUpperCase() + p.slice(1) : "Vata";
  return { key: p || "vata", label };
}

export function getWellnessCards(primaryDosha: Dosha, secondaryDosha?: Dosha | null): WellnessCard[] {
  const { key, label } = normalizeDoshaKey(primaryDosha, secondaryDosha);

  const isVataDominant = key.startsWith("vata");
  const isPittaDominant = key.startsWith("pitta");
  const hasPitta = key.includes("pitta");
  const hasVata = key.includes("vata");

  // CARD 1: FOOD & DIET
  const foodCard: WellnessCard = {
    id: "food",
    title: "Food & Diet",
    icon: "🍲",
    focusArea: isVataDominant
      ? "Warm, grounding, nourishing and moistening meals"
      : isPittaDominant
      ? "Cooling, moderately unctuous, refreshing and soothing meals"
      : "Light, warm, stimulating and well-spiced meals",
    shortDescription: `Traditional Ahara guidance for ${label} balance.`,
    sections: [
      {
        heading: "Suitable Food Choices (Ahara)",
        items: isVataDominant
          ? [
              "Well-cooked whole grains: Basmati rice, oats, wheat, quinoa prepared with ghee.",
              "Warm, soupy legumes: Split yellow moong dal, red lentils, thoroughly cooked with cumin and hing.",
              "Root and sweet vegetables: Carrots, sweet potatoes, beets, zucchini, cooked squash.",
              "Healthy fats: Cow's ghee, unrefined sesame oil, olive oil in moderate quantities.",
              "Sweet ripe fruits: Stewed apples, sweet soaked raisins, ripe bananas, soaked dates, sweet mangos.",
            ]
          : isPittaDominant
          ? [
              "Cooling whole grains: Basmati rice, barley, oats, whole wheat roti.",
              "Sweet and astringent pulses: Moong dal, chickpeas, kidney beans (cooked with coriander and fennel).",
              "Cooling vegetables: Cucumber, bottle gourd (lauki), ridge gourd (turai), asparagus, cilantro, zucchini.",
              "Healthy fats: Cow's ghee, virgin coconut oil, moderate sunflower oil.",
              "Sweet fruits: Ripe sweet melons, pomegranate, sweet pears, soaked Munakka (raisins), fresh coconut water.",
            ]
          : [
              "Light grains: Millets (jowar, bajra, ragi in moderation), roasted barley, buckwheat, aged basmati rice.",
              "Astringent legumes: Green moong dal, masoor dal, horsegram (kulthi), chana.",
              "Light vegetables: Bitter gourd (karela), methi leaves, spinach, cabbage, radishes, cauliflower, drumsticks.",
              "Healthy fats in strict moderation: Mustard oil, sesame oil; minimal ghee.",
              "Light fruits: Apples, pomegranates, cranberries, amla; avoid heavy unctuous fruits.",
            ],
      },
      {
        heading: "Foods to Limit or Moderate",
        items: isVataDominant
          ? [
              "Dry, cold, raw foods: Raw salads, crackers, iced beverages, and refrigerated leftovers.",
              "Pungent and excessively bitter foods that aggravate Vata dryness.",
              "Heavy gas-forming beans: Whole black gram (urad), rajma, chana unless cooked with digestive spices.",
            ]
          : isPittaDominant
          ? [
              "Sharp, sour and excessively spicy foods: Extreme chilies, vinegar, mustard, pickles, raw onions, and garlic.",
              "Fried, greasy, and fermented items that elevate Pitta heat and acidity.",
              "Excessive caffeine, alcohol, and fermented sour cheeses.",
            ]
          : [
              "Heavy, oily, deep-fried foods and rich sweets: Halwa, pakoras, cheese, and heavy cream.",
              "Cold dairy items: Cold cow's milk, ice cream, curd (especially at night).",
              "Excessively sweet, salty, and sour tastes that promote Kapha sluggishness.",
            ],
      },
      {
        heading: "Six Tastes (Shad Rasa) Framework",
        items: [
          isVataDominant
            ? "Prioritize Madhura (Sweet), Amla (Sour), and Lavana (Salty) tastes to ground and soothe Vata."
            : isPittaDominant
            ? "Prioritize Madhura (Sweet), Tikta (Bitter), and Kashaya (Astringent) tastes to cool and appease Pitta."
            : "Prioritize Katu (Pungent), Tikta (Bitter), and Kashaya (Astringent) tastes to mobilize and reduce Kapha.",
          "Ensure all six tastes are present in at least small amounts throughout the day for systemic harmony.",
        ],
      },
      {
        heading: "Traditional Indian Meal Examples",
        items: [
          isVataDominant
            ? "Breakfast: Warm spiced Daliya (broken wheat porridge) or sweet Suji Halwa made with warm milk and a pinch of cardamom."
            : isPittaDominant
            ? "Breakfast: Soaked rolled oats with pomegranate seeds, or light warm poha with coriander and coconut."
            : "Breakfast: Warm roasted barley or besan chilla with ginger and mint chutney, or warm spiced vegetable dalia.",
          isVataDominant
            ? "Lunch: Khichdi cooked with moong dal and basmati rice, topped with cow's ghee, served with stewed pumpkin or bottle gourd sabzi."
            : isPittaDominant
            ? "Lunch: Warm phulkas with moong dal tadka (cumin, coriander, ghee), lauki or turai sabzi, and fresh mint takra (churned buttermilk)."
            : "Lunch: Jowar or barley roti, horsegram or masoor dal, stir-fried methi or karela sabzi with minimal oil.",
          isVataDominant
            ? "Dinner: Light warm moong soup with ginger and cumin, accompanied by soft steamed vegetables or a single warm roti."
            : isPittaDominant
            ? "Dinner: Light vegetable stew with basmati rice, seasoned with fresh coriander, fennel, and minimal salt."
            : "Dinner: Clear vegetable soup with black pepper, roasted cumin, and steamed green moong sprouts.",
        ],
      },
      {
        heading: "Meal Timing & Agni (Digestive Fire)",
        items: [
          "Take lunch between 12:00 PM and 1:30 PM, when the sun is highest and digestive fire (Agni) is at its peak.",
          "Eat in a calm, seated environment without distractions, mobile screens, or emotional distress.",
          "Allow at least 3 to 4 hours between meals to ensure complete digestion of previous food.",
        ],
      },
      {
        heading: "Seasonal Considerations & Hydration",
        items: [
          hasVata
            ? "Drink warm or room-temperature water. Sip Cumin-Coriander-Fennel (CCF) tea throughout the day."
            : hasPitta
            ? "Drink cool (not iced) water, infused with vetiver (ushira), fennel seeds, or fresh mint leaves."
            : "Drink warm ginger water, tulsi tea, or hot boiled water with a drop of honey (honey added only after cooling).",
          "Avoid drinking large quantities of water during meals; take small sips only to lubricate food.",
        ],
      },
    ],
    details: [
      `Favour ${
        isVataDominant ? "warm, grounding and moistening" : isPittaDominant ? "cooling, calming and soothing" : "light, warm and stimulating"
      } foods tailored to ${label}.`,
      "Emphasize traditional Indian home-cooked meals including khichdi, moong dal, seasonal gourd vegetables, and digestive spices.",
      "Support digestive Agni by eating the main meal at midday and avoiding cold or raw foods at night.",
    ],
  };

  // CARD 2: LIFESTYLE & DINACHARYA
  const lifestyleCard: WellnessCard = {
    id: "lifestyle",
    title: "Lifestyle & Dinacharya",
    icon: "🌅",
    focusArea: isVataDominant
      ? "Predictable rhythm, warmth, calm routines, and nourishing oil massage"
      : isPittaDominant
      ? "Unhurried pace, moderation, cooling leisure, and stress release"
      : "Early wake-up, vigorous activity, stimulating movement, and variety",
    shortDescription: `Daily rhythm and Dinacharya aligned with ${label}.`,
    sections: [
      {
        heading: "Traditional Morning Dinacharya",
        items: [
          isVataDominant
            ? "Wake up gently before 6:30 AM. Wash face, rinse eyes with cool water, and scrape tongue (Jihwa Nirlekhana)."
            : isPittaDominant
            ? "Wake up around 6:00 AM. Rinse eyes with rose water or cool water, clean tongue gently with a copper scraper."
            : "Wake up early during Brahma Muhurta (5:00 AM - 5:30 AM) to break Kapha heaviness. Scrape tongue firmly.",
          "Drink 1 to 2 glasses of warm water (Ushapan) to stimulate peristalsis and flush digestive toxins (Ama).",
          isVataDominant
            ? "Daily Abhyanga: Warm sesame oil full-body self-massage before a warm bath to pacify Vata dryness."
            : isPittaDominant
            ? "Abhyanga: Self-massage with cooling coconut or brahmi oil, followed by a lukewarm shower."
            : "Dry massage (Udvartana): Vigorous massage with herbal powders like chickpea flour, triphala, or calamus.",
        ],
      },
      {
        heading: "Daily Habits & Work Rhythm",
        items: [
          "Maintain strict regularity for wake-up, meal, work, and wind-down times to anchor your nervous system.",
          isVataDominant
            ? "Take regular pauses throughout the workday. Ground yourself with 5 deep diaphragmatic breaths every 2 hours."
            : isPittaDominant
            ? "Avoid over-scheduling, perfectionism, and competitive confrontations. Schedule non-goal-oriented leisure."
            : "Stay on your feet and avoid prolonged sedentary sitting. Take brisk walks after mental tasks.",
        ],
      },
      {
        heading: "Activity and Rest Balance",
        items: [
          isVataDominant
            ? "Keep physical exertion at 50% of capacity (Ardha Shakti). Rest before you feel fatigued."
            : isPittaDominant
            ? "Exercise in the cool hours of the morning or evening. Avoid intense workouts under mid-day heat."
            : "Engage in vigorous, sweat-inducing exercise daily to counteract Kapha accumulation and sluggishness.",
        ],
      },
      {
        heading: "Seasonal Adaptations (Ritucharya)",
        items: [
          "During cold, dry months (Hemanta/Shishira): Increase protective warm clothing and nourishing oil therapies.",
          "During hot months (Grishma): Seek shade, enjoy sweet fragrances, and avoid mid-day sun exposure.",
          "During monsoon (Varsha): Guard against dampness, keep feet dry, and drink purified warm water.",
        ],
      },
    ],
    details: [
      `A consistent daily rhythm (Dinacharya) anchors ${label} constitution.`,
      "Traditional morning practices: Ushapan (warm water), tongue scraping, Abhyanga (oil massage), and mindful hygiene.",
      "Balance work and rest intervals according to your natural energy capacity without extreme exhaustion.",
    ],
  };

  // CARD 3: YOGA & EXERCISE
  const yogaCard: WellnessCard = {
    id: "yoga",
    title: "Yoga & Exercise",
    icon: "🧘",
    focusArea: isVataDominant
      ? "Slow, grounding, restorative poses and calming breathwork"
      : isPittaDominant
      ? "Moderate, cooling, non-competitive flows and soothing forward bends"
      : "Dynamic, heat-building, stimulating flows and active Pranayama",
    shortDescription: "Navigate to your customized Yoga & Wellness studio.",
    sections: [
      {
        heading: "Recommended Yoga Style & Asanas",
        items: [
          isVataDominant
            ? "Focus on grounding standing postures and hip openers: Tadasana (Mountain), Vrikshasana (Tree), Virabhadrasana I, Balasana (Child's Pose), and Paschimottanasana."
            : isPittaDominant
            ? "Focus on cooling Chandra Namaskar (Moon Salutations), gentle heart openers, Bhujangasana (Cobra), Matsyasana (Fish Pose), and calming twists."
            : "Focus on vigorous Surya Namaskar (Sun Salutations), backbends like Dhanurasana (Bow), Ustrasana (Camel), and standing balance poses.",
          "Always close every practice with a minimum of 10 minutes of deep Shavasana for neural integration.",
        ],
      },
      {
        heading: "Pranayama (Breath Regulation)",
        items: [
          isVataDominant
            ? "Nadi Shodhana (Alternate Nostril Breathing) and gentle Ujjayi to soothe the sympathetic nervous system."
            : isPittaDominant
            ? "Sitali and Sitkari (cooling breath) paired with slow Nadi Shodhana to dissipate internal heat and irritability."
            : "Kapalabhati (Skull-shining breath) and Bhastrika (Bellows breath) to kindle metabolic fire and clear congestion.",
        ],
      },
      {
        heading: "Studio Navigation",
        items: [
          "Click this card to navigate directly to our dedicated Yoga & Wellness page.",
          "Explore full video sessions, filter by duration and level, and track your practice completions.",
        ],
      },
    ],
    details: [
      "Navigate directly to our interactive Yoga & Wellness library for sessions matched to your constitution.",
      isVataDominant
        ? "Grounding, steady asanas with slow transitions and Nadi Shodhana breathwork."
        : isPittaDominant
        ? "Cooling moon salutations, moderate twists, and relaxing forward bends."
        : "Invigorating Sun Salutations, heart openers, and energizing Kapalabhati breathing.",
    ],
  };

  // CARD 4: SLEEP & WELLNESS
  const sleepCard: WellnessCard = {
    id: "sleep",
    title: "Sleep & Wellness",
    icon: "🌙",
    focusArea: isVataDominant
      ? "Nourishing Nidra, nervous system calm, and 8 hours of quiet rest"
      : isPittaDominant
      ? "Cool bedroom, peaceful mental disengagement, and 7-8 hours of sleep"
      : "Early morning waking, avoiding daytime naps, and 6-7 hours of sleep",
    shortDescription: `Ayurvedic Nidra principles for ${label} restoration.`,
    sections: [
      {
        heading: "Traditional Ayurvedic Nidra Concepts",
        items: [
          "Nidra is revered in Charaka Samhita as one of the three pillars of life (Trayopasthambha), alongside Ahara and Brahmacharya.",
          "Quality sleep restores Ojas (vital immunity, radiance, and longevity) and purges mental fatigue (Klama).",
        ],
      },
      {
        heading: "Evening Wind-Down Routine",
        items: [
          "Turn off all blue-light digital screens at least 60 minutes before retiring to bed.",
          isVataDominant
            ? "Pada Abhyanga: Massage the soles of your feet with warm sesame or ghee before sleeping to ground racing thoughts."
            : isPittaDominant
            ? "Apply a drop of cooling coconut or sandalwood oil to the temples and soles of the feet."
            : "Keep the evening light and active; avoid falling asleep on the sofa right after dinner.",
          isVataDominant
            ? "Sip a warm cup of spiced golden milk (cow or almond milk with a pinch of nutmeg and turmeric) 30 minutes before bed."
            : isPittaDominant
            ? "Sip warm milk infused with fennel, cardamom, and a pinch of rose petal powder."
            : "Sip warm chamomile or light tulsi tea; avoid heavy milk drinks late at night.",
        ],
      },
      {
        heading: "Relaxation & Stress-Management Practices",
        items: [
          "Practice 10 minutes of Yoga Nidra (conscious yogic relaxation) while lying comfortably in bed.",
          "Perform 5 to 7 rounds of Bhramari (humming bee breath) to pacify mental stress and quiet monkey-mind chatter.",
          "Cultivate Sattvic thoughts: Reflect on three moments of gratitude from the day before turning off lights.",
        ],
      },
    ],
    details: [
      "Ayurvedic Nidra concepts recognize restful sleep as fundamental to mental equilibrium and cellular regeneration.",
      "Evening practices: Digital wind-down, warm spiced milk, Pada Abhyanga (foot massage), and Yoga Nidra.",
      "Cultivate Sattvic mental calm by balancing daily stressors and maintaining consistent bedtimes.",
    ],
  };

  // CARD 5: AYURVEDIC GUIDANCE
  const guidanceCard: WellnessCard = {
    id: "guidance",
    title: "Ayurvedic Guidance",
    icon: "🌿",
    focusArea: "Fundamental principles of Ahara, Vihara, Dinacharya, and Ritucharya",
    shortDescription: `Classical Ayurvedic health concepts for ${label}.`,
    sections: [
      {
        heading: "The Three Doshas (Tridosha Siddhanta)",
        items: [
          "Vata (Ether + Air): Governs all biological movement, nerve impulses, breath, and circulation.",
          "Pitta (Fire + Water): Governs digestion, enzyme metabolism, body temperature, and cognitive discernment.",
          "Kapha (Water + Earth): Governs structural cohesion, lubrication, hydration, immunity, and stability.",
          `Your individual Prakriti is characterized as ${label}. Your daily habits should maintain this natural equilibrium without allowing excess accumulation.`,
        ],
      },
      {
        heading: "Ahara and Vihara (Food and Conduct)",
        items: [
          "Ahara (Nutritional intake): Wholesome food suitable to your digestive Agni and current season.",
          "Vihara (Daily conduct & lifestyle): Harmonious actions, posture, thoughts, and physical exertion.",
          "Sadvritta (Right moral conduct): Mental peace, compassion, honesty, and respectful relationships are recognized in classical texts as essential to physical health.",
        ],
      },
      {
        heading: "Dinacharya & Ritucharya (Daily & Seasonal Rhythms)",
        items: [
          "Living in synchrony with nature's diurnal cycle: Align waking with morning Kapha, peak work with midday Pitta, and rest with evening Kapha.",
          "Ritucharya: Shifting your diet and habits smoothly during seasonal junctures (Ritu Sandhi) to prevent seasonal illness.",
        ],
      },
      {
        heading: "Educational & Safety Boundaries",
        items: [
          "Prakriti is an educational wellness framework, NOT a clinical diagnosis or genetic classification.",
          "Arogyanvesha provides Ayurvedic lifestyle guidance and traditional knowledge; it does not prescribe prescription pharmaceuticals, dosages, or replace allopathic physicians.",
          "Always seek qualified medical evaluation for acute, progressive, or severe symptoms.",
        ],
      },
    ],
    details: [
      "Core principles of Ayurveda: Tridosha balance (Vata, Pitta, Kapha), Ahara (nutrition), and Vihara (lifestyle conduct).",
      "Dinacharya (daily rhythm) and Ritucharya (seasonal cycle) keep your natural biological clock tuned to nature.",
      "This guidance is educational and intended to complement, not replace, regular healthcare and professional medical care.",
    ],
  };

  return [foodCard, lifestyleCard, yogaCard, sleepCard, guidanceCard];
}
