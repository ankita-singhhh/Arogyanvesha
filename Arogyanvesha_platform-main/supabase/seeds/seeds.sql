-- Seeds file: Populate library tables

-- 1. Prakriti Questions
INSERT INTO prakriti_questions (id, text, category, order_index) VALUES
(0, 'How would you describe your body frame?', 'physical', 0),
(1, 'What best describes your skin?', 'physical', 1),
(2, 'How is your digestion typically?', 'digestive', 2),
(3, 'How do you typically make decisions?', 'mental', 3),
(4, 'How would you describe your sleep?', 'sleep', 4),
(5, 'Under stress, how do you typically react?', 'emotional', 5),
(6, 'How do you feel about cold weather?', 'physical', 6),
(7, 'How would you describe your learning style?', 'mental', 7),
(8, 'How is your appetite?', 'digestive', 8),
(9, 'How would you describe your hair?', 'physical', 9),
(10, 'How do you typically feel emotionally?', 'emotional', 10),
(11, 'How are your joints and bones?', 'physical', 11),
(12, 'How do you handle change?', 'mental', 12),
(13, 'How do you experience thirst?', 'digestive', 13),
(14, 'How is your energy throughout the day?', 'physical', 14),
(15, 'What are your speech patterns like?', 'emotional', 15),
(16, 'How long do you usually sleep?', 'sleep', 16),
(17, 'How do you respond to exercise?', 'physical', 17),
(18, 'How would others describe your personality?', 'mental', 18),
(19, 'What foods do you naturally crave?', 'digestive', 19)
ON CONFLICT (id) DO NOTHING;

-- 2. Prakriti Options
INSERT INTO prakriti_options (id, question_id, text, dosha) VALUES
('v0', 0, 'Thin, light, difficult to gain weight', 'vata'),
('p0', 0, 'Medium build, muscular, easy to maintain weight', 'pitta'),
('k0', 0, 'Large frame, solid, tends to gain weight easily', 'kapha'),
('v1', 1, 'Dry, rough, or thin — tends to crack', 'vata'),
('p1', 1, 'Sensitive, oily in places, prone to redness or rashes', 'pitta'),
('k1', 1, 'Thick, smooth, oily, soft — rarely has issues', 'kapha'),
('v2', 2, 'Irregular — sometimes strong, sometimes weak', 'vata'),
('p2', 2, 'Strong — I get very hungry and irritable if I miss meals', 'pitta'),
('k2', 2, 'Slow and steady — I can skip meals without much discomfort', 'kapha'),
('v3', 3, 'Quickly, but I often change my mind', 'vata'),
('p3', 3, 'Decisively and confidently — I stick to my choices', 'pitta'),
('k3', 3, 'Slowly and carefully — I prefer to think it over', 'kapha'),
('v4', 4, 'Light, interrupted — I wake up easily', 'vata'),
('p4', 4, 'Moderate — I sleep well but sometimes have vivid dreams', 'pitta'),
('k4', 4, 'Deep and long — I find it hard to wake up', 'kapha'),
('v5', 5, 'Anxious, worried, overwhelmed', 'vata'),
('p5', 5, 'Irritable, angry, demanding', 'pitta'),
('k5', 5, 'Withdrawn, stubborn, avoidant', 'kapha'),
('v6', 6, 'I dislike cold — I always feel chilly', 'vata'),
('p6', 6, 'I prefer cool weather — I overheat easily', 'pitta'),
('k6', 6, 'I can tolerate cold but prefer warmth', 'kapha'),
('v7', 7, 'I learn quickly but also forget quickly', 'vata'),
('p7', 7, 'I focus intensely and remember well', 'pitta'),
('k7', 7, 'I learn slowly but retain information very well', 'kapha'),
('v8', 8, 'Variable — sometimes I forget to eat', 'vata'),
('p8', 8, 'Strong — I get very hungry at regular times', 'pitta'),
('k8', 8, 'Moderate — I could comfortably eat less', 'kapha'),
('v9', 9, 'Dry, frizzy, thin or coarse', 'vata'),
('p9', 9, 'Fine, oily, prone to early greying or thinning', 'pitta'),
('k9', 9, 'Thick, lustrous, oily', 'kapha'),
('v10', 10, 'Enthusiastic but prone to anxiety', 'vata'),
('p10', 10, 'Motivated and goal-oriented but can be critical', 'pitta'),
('k10', 10, 'Content and easygoing but prone to attachment', 'kapha'),
('v11', 11, 'Prominent, cracking sounds, prone to dryness', 'vata'),
('p11', 11, 'Flexible and moderately built', 'pitta'),
('k11', 11, 'Large, well-padded, rarely have issues', 'kapha'),
('v12', 12, 'I embrace change but it can make me anxious', 'vata'),
('p12', 12, 'I manage change well when I can plan for it', 'pitta'),
('k12', 12, 'I prefer routine and resist change', 'kapha'),
('v13', 13, 'Variable — I often forget to drink water', 'vata'),
('p13', 13, 'High — I get very thirsty frequently', 'pitta'),
('k13', 13, 'Low — I rarely feel very thirsty', 'kapha'),
('v14', 14, 'Bursts of energy followed by fatigue', 'vata'),
('p14', 14, 'Sustained energy — I push myself', 'pitta'),
('k14', 14, 'Steady but sometimes slow to start', 'kapha'),
('v15', 15, 'Fast, talkative, sometimes tangential', 'vata'),
('p15', 15, 'Clear, precise, and persuasive', 'pitta'),
('k15', 15, 'Slow, deliberate, thoughtful', 'kapha'),
('v16', 16, 'Less than 7 hours — I wake early or late', 'vata'),
('p16', 16, '6–8 hours — I sleep consistently', 'pitta'),
('k16', 16, 'More than 8 hours — I love sleep', 'kapha'),
('v17', 17, 'I enjoy it but tire quickly and need rest', 'vata'),
('p17', 17, 'I love competition and push hard', 'pitta'),
('k17', 17, 'I can sustain long workouts but need motivation to start', 'kapha'),
('v18', 18, 'Creative, expressive, enthusiastic', 'vata'),
('p18', 18, 'Confident, determined, intelligent', 'pitta'),
('k18', 18, 'Caring, patient, reliable', 'kapha'),
('v19', 19, 'Warm, moist, oily foods', 'vata'),
('p19', 19, 'Cool, refreshing, sweet and bitter foods', 'pitta'),
('k19', 19, 'Light, dry, spicy foods', 'kapha')
ON CONFLICT (id) DO NOTHING;

-- 3. Routine Practices
INSERT INTO routine_practices (id, name, description, time_of_day, duration_minutes, dosha_recommended, order_index) VALUES
('early-wake', 'Brahma Muhurta Waking', 'Wake up 1.5 hours before sunrise to sync with nature.', 'morning', 0, 'all', 0),
('water-sip', 'Ushapan (Warm Water)', 'Drink copper-charged warm water first thing in the morning.', 'morning', 5, 'all', 1),
('tongue-scraping', 'Jihwa Nirlekhan', 'Scrape tongue front-to-back to clear Ama (toxins).', 'morning', 2, 'all', 2),
('mouth-pulling', 'Gandusha (Oil Pulling)', 'Swish organic sesame or coconut oil for 5-15 mins.', 'morning', 10, 'all', 3),
('nasal-drops', 'Nasya (Nasal Therapy)', 'Apply 2 drops of Anu taila in each nostril.', 'morning', 3, 'vata', 4),
('body-massage', 'Abhyanga (Self-Massage)', 'Massage warm oil onto body before bathing.', 'morning', 15, 'vata', 5),
('yoga-med', 'Dinacharya Yoga', 'Perform dosha-specific asanas and pranayama.', 'morning', 20, 'all', 6),
('light-breakfast', 'Mitahara Breakfast', 'Eat warm, freshly cooked breakfast matching your dosha.', 'morning', 15, 'all', 7),
('main-lunch', 'Lunch (Agni Peak)', 'Eat your largest meal when Agni is strongest (12 - 2 PM).', 'afternoon', 30, 'all', 8),
('walk-breath', 'Shatapadi Walk', 'Take 100 gentle steps after meals to support digestion.', 'afternoon', 10, 'all', 9),
('relax-ref', 'Pranayama Pause', 'Calm the mind with alternate nostril breathing.', 'evening', 5, 'pitta', 10),
('light-dinner', 'Light Dinner', 'Eat a simple digestible dinner at least 2 hours before bed.', 'evening', 25, 'all', 11),
('foot-massage', 'Pada Abhyanga', 'Massage feet with ghee or oil to promote deep sleep.', 'night', 5, 'all', 12),
('meditation', 'Dhyana', 'Quiet reflection, journaling, or meditation before sleep.', 'night', 10, 'all', 13),
('early-sleep', 'Nidra (Sleep)', 'Aim to sleep by 10 PM to allow proper liver detox.', 'night', 480, 'all', 14)
ON CONFLICT (id) DO NOTHING;

-- 4. Achievements
INSERT INTO achievements (id, title, description, icon, condition_type, condition_value) VALUES
('prakriti-complete', 'Prakriti Unlocked', 'Discover your primary and secondary Dosha composition.', 'sparkles', 'prakriti_completed', 1),
('streak-3', 'Habit Builder', 'Maintain a daily routine streak of 3 days.', 'fire', 'streak', 3),
('streak-7', 'Ayurvedic Disciple', 'Maintain a daily routine streak of 7 days.', 'trophy', 'streak', 7),
('streak-30', 'Dinacharya Master', 'Maintain a daily routine streak of 30 days.', 'crown', 'streak', 30),
('yoga-5', 'Yogi Journey', 'Complete 5 yoga sessions.', 'lotus', 'yoga_sessions', 5),
('wisdom-5', 'Wisdom Seeker', 'Read 5 Ayurvedic literature articles.', 'book', 'articles_read', 5)
ON CONFLICT (id) DO NOTHING;

-- 5. Yoga Sessions
INSERT INTO yoga_sessions (title, description, duration_minutes, level, category, thumbnail_url, video_url, dosha_target) VALUES
('Vata-Pacifying Grounding Yoga', 'Slow, stabilizing movements to calm erratic air and space elements.', 25, 'beginner', 'Asana', '/images/yoga/vata.jpg', 'https://www.youtube.com/watch?v=vata1', 'vata'),
('Pitta-Cooling flow', 'Calming forward folds and moon salutations to cool fiery heat.', 20, 'intermediate', 'Asana', '/images/yoga/pitta.jpg', 'https://www.youtube.com/watch?v=pitta1', 'pitta'),
('Kapha-Stimulating energizer', 'Vigorous sun salutations and chest openers to clear sluggish earth elements.', 30, 'intermediate', 'Asana', '/images/yoga/kapha.jpg', 'https://www.youtube.com/watch?v=kapha1', 'kapha'),
('Daily Nadi Shodhana Pranayama', 'Balance left and right hemispheres of the brain.', 10, 'beginner', 'Pranayama', '/images/yoga/nadi.jpg', 'https://www.youtube.com/watch?v=nadi1', 'all'),
('Deep Yoga Nidra Rest', 'Guided meditation for physical and neurological recovery.', 20, 'beginner', 'Meditation', '/images/yoga/nidra.jpg', 'https://www.youtube.com/watch?v=nidra1', 'all')
ON CONFLICT (id) DO NOTHING;

-- 6. Herbs
INSERT INTO herbs (slug, name, sanskrit_name, botanical_name, description, vata_effect, pitta_effect, kapha_effect, category) VALUES
('ashwagandha', 'Ashwagandha', 'Vajigandha', 'Withania somnifera', 'Vigor-enhancing adaptogen that calms Vata.', 'decreases', 'neutral', 'neutral', 'Rejuvenative'),
('shatavari', 'Shatavari', 'Shatavari', 'Asparagus racemosus', 'Nurturing root that cools Pitta and nourishes tissues.', 'decreases', 'decreases', 'increases', 'Nervine'),
('amalaki', 'Amla / Indian Gooseberry', 'Amalaki', 'Phyllanthus emblica', 'Rich source of Vitamin C that balances all three doshas.', 'decreases', 'decreases', 'decreases', 'Antioxidant'),
('haritaki', 'Haritaki', 'Haritaki', 'Terminalia chebula', 'Mild laxative that digests toxins and balances Vata.', 'decreases', 'neutral', 'decreases', 'Digestive'),
('bibhitaki', 'Bibhitaki', 'Bibhitaki', 'Terminalia bellirica', 'Astringent herb that supports lungs and Kapha.', 'neutral', 'neutral', 'decreases', 'Respiratory'),
('tulsi', 'Holy Basil', 'Tulsi', 'Ocimum sanctum', 'Sacred herb that warms lungs and clears Kapha congestion.', 'decreases', 'increases', 'decreases', 'Immune Support'),
('turmeric', 'Turmeric', 'Haridra', 'Curcuma longa', 'Powerful anti-inflammatory that purifies blood.', 'neutral', 'neutral', 'decreases', 'Anti-inflammatory'),
('ginger', 'Ginger', 'Ardraka', 'Zingiber officinale', 'Universal digestive spark that kindles Agni.', 'decreases', 'increases', 'decreases', 'Digestive'),
('brahmi', 'Brahmi', 'Brahmi', 'Bacopa monnieri', 'Nootropic herb that improves concentration and reduces anxiety.', 'decreases', 'decreases', 'neutral', 'Nervine'),
('guduchi', 'Guduchi', 'Amrita', 'Tinospora cordifolia', 'Immune modulator that clears heat and updates skin.', 'decreases', 'decreases', 'decreases', 'Rejuvenative')
ON CONFLICT (slug) DO NOTHING;


-- 7. Wisdom Articles
INSERT INTO wisdom_articles (slug, title, excerpt, content, category, read_time_minutes, is_featured) VALUES
('intro-to-ayurveda', 'Introduction to Ayurveda: The Science of Life', 'Learn the core principles of Ayurveda, five elements, and basic constitution.', 'Ayurveda is a 5,000‑year‑old system of natural healing that views health as a balance of the five elements (earth, water, fire, air, ether) within the body. It classifies individuals by their dosha (Vata, Pitta, Kapha) based on physical, mental and emotional traits. This article provides an overview of these concepts and how they guide diet, lifestyle and therapeutic choices. **Disclaimer:** The information reflects traditional Ayurvedic perspectives and is not a substitute for professional medical advice.', 'Ayurveda Fundamentals', 5, true),
('dosha-overview', 'Understanding the Three Doshas', 'A concise guide to Vata, Pitta, and Kapha and their characteristics.', 'The three doshas represent functional principles governing the body:\n\n- **Vata** (air‑energy) – mobility, creativity, dry skin, quick thoughts.\n- **Pitta** (fire‑energy) – metabolism, sharp intellect, warm body temperature, prone to inflammation.\n- **Kapha** (earth‑water) – structure, stability, calmness, strong immunity.\n\nEach person has a unique blend, with one or two dominant doshas. Knowing your dosha helps tailor diet, activity and self‑care to maintain balance. **Disclaimer:** This is traditional knowledge and not medical diagnosis.', 'Ayurveda Fundamentals', 4, false),
('agni-digestion', 'Kindling Your Agni: The Secret to Perfect Digestion', 'Understand Agni, the metabolic fire, and how to keep it strong.', 'Agni (digestive fire) is central to Ayurvedic health. Strong Agni transforms food into nutrients and eliminates waste. Signs of weak Agni include bloating, gas, and sluggish metabolism. Strategies to kindle Agni include warm cooked meals, spices like ginger and black pepper, and regular meal times. **Disclaimer:** This guidance is traditional and not a substitute for medical treatment.', 'Food & Nutrition', 6, false),
('ama-awareness', 'Ama: The Hidden Toxin', 'Learn what ama is and how it affects health.', 'Ama is a sticky, toxic by‑product of incomplete digestion. It can manifest as feeling of heaviness, clouded mind, or skin issues. Reducing ama involves incorporating bitter greens, warm liquids, and avoiding overeating. **Disclaimer:** Information reflects traditional Ayurvedic concepts.', 'Ayurveda Fundamentals', 5, false),
('dinacharya-guide', 'Mastering Dinacharya: The Ayurvedic Daily Routine', 'A step‑by‑step breakdown of daily rituals to sync your body clock.', 'Dinacharya (daily routine) aligns the body with natural cycles. Key practices include waking at Brahma Muhurta, tongue scraping, oil pulling, warm water intake, self‑massage (abhyanga), yoga, and a balanced dinner at least two hours before sleep. Each practice supports digestion, detoxification, and mental clarity. **Disclaimer:** Practices are traditional; consult a healthcare professional if you have specific conditions.', 'Dinacharya', 8, true),
('ritucharya-seasonal', 'Ritucharya: Seasonal Wellness Practices', 'Adjust your lifestyle to the changing seasons.', 'Ritucharya (seasonal routine) recommends diet and habits that match the dominant dosha of each season. For example, in summer (Pitta‑dominated) favor cooling foods, avoid excess heat, and practice calming yoga. In winter (Vata‑dominated) emphasize warming, oily foods, and grounding practices. **Disclaimer:** Traditional guidance; not a substitute for medical advice.', 'Ritucharya', 7, false),
('herb-ashwagandha', 'Ashwagandha: An Adaptogenic Herb', 'Benefits, safety and usage of Ashwagandha.', 'Ashwagandha (Withania somnifera) is traditionally used to promote vitality and calm Vata. It may support stress resilience and sleep. Contraindications: avoid during pregnancy, hyperthyroidism, or when taking sedatives. Consult a healthcare professional before use. **Disclaimer:** Traditional use information only.', 'Herbs & Botanicals', 4, false),
('herb-tulsi', 'Tulsi (Holy Basil): Immune Support', 'Traditional uses and precautions for Tulsi.', 'Tulsi is revered for its warming, antimicrobial properties and is commonly used to support respiratory health. It may increase Kapha clearance. Contraindications: excessive use may aggravate stomach acidity; avoid in pregnancy without guidance. **Disclaimer:** Traditional use information only.', 'Herbs & Botanicals', 4, false),
('food-mitahara', 'Mitahara: Mindful Eating Principles', 'Guidelines for balanced Ayurvedic eating.', 'Mitahara emphasizes fresh, seasonal, and dosha‑appropriate foods. Eat when Agni is strongest (mid‑day), chew thoroughly, and avoid overeating. Include all six tastes in each meal for nutritional completeness. **Disclaimer:** Traditional dietary advice; not medical prescription.', 'Food & Nutrition', 5, false),
('yoga-beginners', 'Yoga for Beginners: Foundations', 'Introductory yoga sequence and safety tips.', 'A gentle sequence for beginners: Cat‑Cow, Downward Dog, Warrior I, and Savasana. Emphasize alignment, breath awareness, and avoid pushing into pain. Those with joint issues should modify poses and consult a qualified instructor. **Disclaimer:** Yoga guidance is traditional; seek professional advice for injuries.', 'Yoga & Pranayama', 6, true),
('pranayama-breath', 'Pranayama Basics: Breath for Balance', 'Simple breathing techniques and contraindications.', 'Alternate Nostril (Nadi Shodhana) balances the nervous system and calms Vata and Pitta. Practice 5 minutes daily. Contraindications include recent surgery, severe hypertension, or asthma flare‑up; seek medical advice if unsure. **Disclaimer:** Traditional breathing practice information.', 'Yoga & Pranayama', 4, false),
('abhyanga-guide', 'Abhyanga: Self‑Massage for Wellness', 'How to perform Abhyanga safely.', 'Abhyanga involves massaging warm oil (Sesame for Vata, Coconut for Pitta, Mustard for Kapha) onto the body before bathing. Benefits include improved circulation, joint mobility, and calm mind. Avoid if you have open wounds, severe skin conditions, or acute fever. **Disclaimer:** Traditional practice; not a medical treatment.', 'Traditional Wellness Practices', 5, false),
('shirodhara-intro', 'Shirodhara: Calm the Mind', 'Overview of Shirodhara therapy.', 'Shirodhara is a therapy where warm oil streams over the forehead, soothing the nervous system. Traditionally used for anxiety, insomnia, and stress. Contraindications include severe headaches, skin infections on the scalp, or during pregnancy without supervision. **Disclaimer:** Traditional therapy description only.', 'Traditional Wellness Practices', 5, false);
ON CONFLICT (slug) DO NOTHING;

-- See wisdom_articles_seed.sql for 100 additional, idempotent Wisdom Library articles.
\ir wisdom_articles_seed.sql
