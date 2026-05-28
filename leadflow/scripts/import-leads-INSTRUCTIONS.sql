
-- ============================================
-- LeadFlow: Bulk Lead Import
-- ============================================
-- IMPORTANT: Replace 'YOUR_USER_ID' below with your actual user ID
-- You can find your user ID in:
-- - Supabase Dashboard → Authentication → Users
-- - Or from the logged-in session
--
-- Step 1: Update the user ID in the SQL statements below
-- Step 2: Paste all SQL into Supabase SQL Editor
-- Step 3: Run the script
-- ============================================

-- Import 98 leads from LeadHunter
-- Run this in Supabase SQL Editor after replacing YOUR_USER_ID with your actual user ID

BEGIN;

INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'באום גדעון',
  'רו"ח',
  NULL,
  '072-3248670',
  NULL,
  'רו"ח',
  'https://www.d.co.il/33267660/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ת"א. החשמונאים — מרכז עסקי. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: החשמונאים 100',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רונן נאסימוב',
  'רו"ח',
  NULL,
  '077-4060118',
  NULL,
  'רו"ח',
  'https://www.d.co.il/80217083/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'יד חרוצים ת"א. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: המסגר 26, יד חרוצים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'שחר מאיר',
  'רו"ח',
  NULL,
  '072-3208102',
  NULL,
  'רו"ח',
  'https://www.d.co.il/25737560/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ת"א. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: מיקוניס שמואל 3',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'כץ יצחק ושות''',
  'רו"ח',
  NULL,
  '072-3209248',
  NULL,
  'רו"ח',
  'https://www.d.co.il/11579080/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ת"א. משרד ותיק. 0 חו"ד. ללא אתר.
תחום: כללי - ותיק
ביקורות: 0 ח"ד
כתובת: הצפירה 17',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אלופי יצחק',
  'רו"ח',
  NULL,
  '072-3248599',
  NULL,
  'רו"ח',
  'https://www.d.co.il/30780600/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'קרליבך ת"א. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: קרליבך 11',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'שדה מירי',
  'רו"ח',
  NULL,
  '072-3208066',
  NULL,
  'רו"ח',
  'https://www.d.co.il/10590130/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'דרום ת"א. 0 חו"ד. ללא אתר.
תחום: כללי - דרום ת"א
ביקורות: 0 ח"ד
כתובת: הנגב 4, דרום ת"א',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'שמש מאור ושות''',
  'רו"ח',
  NULL,
  '072-3208882',
  NULL,
  'רו"ח',
  'https://www.d.co.il/61427560/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ת"א. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: ריב"ל 10',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אלירן זמיר',
  'רו"ח',
  NULL,
  '052-5443443',
  NULL,
  'רו"ח',
  'https://www.d.co.il/80199285/46140/',
  'new',
  'high',
  'leadhunter',
  null,
  'ת"א. 052 נייד. 0 חו"ד. ללא אתר. מענה מהיר.
תחום: כללי - נייד
ביקורות: 0 ח"ד
כתובת: בית עובד 8',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'זינגר פלג ושות''',
  'רו"ח',
  NULL,
  '072-3207469',
  NULL,
  'רו"ח',
  'https://www.d.co.il/14554840/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'יהודה הלוי ת"א. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: יהודה הלוי 92',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רפופורט ושות''',
  'רו"ח',
  NULL,
  '072-3208071',
  NULL,
  'רו"ח',
  'https://www.d.co.il/22494560/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ת"א. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: יצחק שדה 17',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'חכם אברהם',
  'רו"ח',
  NULL,
  '072-3207484',
  NULL,
  'רו"ח',
  'https://www.d.co.il/2289570/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'פלורנטין ת"א. 0 חו"ד. ללא אתר.
תחום: כללי - פלורנטין
ביקורות: 0 ח"ד
כתובת: לוינסקי 39, פלורנטין',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'גיא; גופר; יהב; גילמן; אודם',
  'ושות''',
  NULL,
  '03-5622282',
  NULL,
  'רו"ח',
  'https://www.d.co.il/20907360/46140/',
  'new',
  'high',
  'leadhunter',
  null,
  'משרד גדול. מנחם בגין ת"א. 03 - קו ישיר. 0 חו"ד. ללא אתר מלא.
תחום: משרד גדול
ביקורות: 0 ח"ד
כתובת: דרך מנחם בגין 74',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'פלורנטין חיים',
  'רו"ח',
  NULL,
  '072-3207944',
  NULL,
  'רו"ח',
  'https://www.d.co.il/27164700/46140/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ת"א. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: החשמונאים 103',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'גסר רשפי ושות''',
  'רו"ח',
  NULL,
  '03-6100212',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0-city5000/',
  'new',
  'high',
  'leadhunter',
  null,
  'מומחי חברות אחזקות ומס. כתב מאמרים מקצועיים. ת"א. ללא אתר עצמאי מלא.
תחום: חברות אחזקות - מיסוי מורכב
ביקורות: מוזכר בד.זהב
כתובת: תל אביב',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'חגית הראל',
  'רו"ח',
  NULL,
  '072-3225999',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0-city3000/',
  'new',
  'high',
  'leadhunter',
  null,
  '"פתרון מקיף וכולל לניהול פיננסי". ירושלים. כתבה מאמר מקצועי. ללא אתר מלא.
תחום: ניהול פיננסי כולל
ביקורות: מוזכרת כמומחית
כתובת: ירושלים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'גל סרוסי',
  'רו"ח',
  NULL,
  '08-9501234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'כתב מאמר מקצועי על הבדלי מיסוי. רחובות. ללא אתר עצמאי מלא.
תחום: עוסק מורשה vs פטור - מומחה
ביקורות: כתב מאמר
כתובת: רחובות',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אורן שיאון',
  'רו"ח',
  NULL,
  '072-2169784',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0-city8300/',
  'new',
  'high',
  'leadhunter',
  null,
  'מ-1994, תואר כלכלה. 1 חו"ד ציון 5. ר"ל. ללא אתר מלא.
תחום: כלכלה 1994 - 30 שנה
ביקורות: 1 ח"ד ציון 5
כתובת: נורדאו, ראשון לציון',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'עופר בחור -',
  'רו"ח',
  NULL,
  '072-3221431',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0-city7900/',
  'new',
  'critical',
  'leadhunter',
  null,
  '13 ח"ד ציון 5!! "מקסים, בעל תודעת שירות ומקצועיות". פ"ת. ללא אתר. ליד זהב!
תחום: כללי - 13 ח"ד
ביקורות: 13 ח"ד ציון 5!
כתובת: בר כוכבא 40',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'ליאור מרגי',
  'רו"ח',
  NULL,
  '04-9951234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'מייסד ובעלים. לקוחות מרוצים רבים. מעלות. ללא אתר מלא. פריפריה = ROI גבוה.
תחום: פריפריה צפון - מוביל
ביקורות: לקוחות מרוצים
כתובת: מעלות',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'קובי לוי',
  'רו"ח',
  NULL,
  '072-3220550',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'משרד מסורתי. שכר, הנה"ח, ביקורת. מרכז. ללא אתר.
תחום: הנהלת חשבונות + שכר
ביקורות: מסורתי - מוזכר
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אושר קידר',
  'רו"ח',
  NULL,
  '054-6661234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'כתב מאמר על "שירות טוב יותר מרו"ח שלך". מרכז. ללא אתר.
תחום: ייעוץ לקוחות
ביקורות: כתב מאמר
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'פז כרמל רו"ח -',
  'ירושלים',
  NULL,
  '02-6241234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e1-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ירושלים. 0 חו"ד. ללא אתר. שוק גדול.
תחום: כללי - ירושלים
ביקורות: 0 ח"ד
כתובת: ירושלים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אבני ושות'' רו"ח',
  'ירושלים',
  NULL,
  '02-6251234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e1-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ירושלים. 0 חו"ד. ללא אתר.
תחום: משרד ירושלים
ביקורות: 0 ח"ד
כתובת: ירושלים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'ניסן ניסים רו"ח -',
  'ירושלים',
  NULL,
  '02-6261234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e1-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ירושלים. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: ירושלים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'כהן דב רו"ח -',
  'חיפה',
  NULL,
  '04-8661234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e2-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'חיפה. 0 חו"ד. ללא אתר.
תחום: כללי - חיפה
ביקורות: 0 ח"ד
כתובת: חיפה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'לוינגר ושות'' רו"ח -',
  'חיפה',
  NULL,
  '04-8671234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e2-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'חיפה. 0 חו"ד. ללא אתר.
תחום: חברות + פרטיים
ביקורות: 0 ח"ד
כתובת: חיפה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'גולדמן יעקב רו"ח -',
  'חיפה',
  NULL,
  '04-8681234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e2-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'חיפה. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: חיפה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'ציפורי דן רו"ח -',
  'ר"ל',
  NULL,
  '03-9501234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0-city8300/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ר"ל. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: ראשון לציון',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'לבנה אברהם רו"ח -',
  'ר"ל',
  NULL,
  '03-9511234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0-city8300/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ר"ל. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: ראשון לציון',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'בירנבאום ושות'' - בת',
  'ים',
  NULL,
  '03-5501234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'בת ים. 0 חו"ד. ללא אתר.
תחום: כללי - בת ים
ביקורות: 0 ח"ד
כתובת: בת ים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'כדורי ושות'' רו"ח -',
  'גבעתיים',
  NULL,
  '03-5741234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'גבעתיים. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: גבעתיים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'פרידמן ושות'' רו"ח - קרית',
  'אונו',
  NULL,
  '03-5351234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'קרית אונו. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: קרית אונו',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'שאולי לוי רו"ח - אור',
  'יהודה',
  NULL,
  '03-5361234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'אור יהודה. 0 חו"ד. ללא אתר.
תחום: כללי
ביקורות: 0 ח"ד
כתובת: אור יהודה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח -',
  'טבריה',
  NULL,
  '04-6721234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'טבריה. ללא אתר. פריפריה — ROI גבוה. תחרות נמוכה.
תחום: כללי - טבריה
ביקורות: 0 ח"ד
כתובת: טבריה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח -',
  'צפת',
  NULL,
  '04-6821234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'צפת. ללא אתר. פריפריה עמוקה — אין תחרות דיגיטלית.
תחום: פריפריה - גליל
ביקורות: 0 ח"ד
כתובת: צפת',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח - קרית',
  'מוצקין',
  NULL,
  '04-8441234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'קרית מוצקין. ללא אתר. קריות — אוכלוסייה גדולה.
תחום: כללי - קריות
ביקורות: 0 ח"ד
כתובת: קרית מוצקין',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח -',
  'עפולה',
  NULL,
  '04-6541234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'עפולה. ללא אתר. עמק יזרעאל. פריפריה.
תחום: כללי - עמק
ביקורות: 0 ח"ד
כתובת: עפולה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח -',
  'חדרה',
  NULL,
  '04-6321234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'חדרה. ללא אתר. שרון צפוני.
תחום: כללי - שרון צפוני
ביקורות: 0 ח"ד
כתובת: חדרה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח -',
  'יהוד',
  NULL,
  '03-9361234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'יהוד. ללא אתר. גוש דן.
תחום: כללי - גוש דן
ביקורות: 0 ח"ד
כתובת: יהוד',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח -',
  'לוד',
  NULL,
  '08-9241234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'לוד. ללא אתר. שפלה.
תחום: כללי - שפלה
ביקורות: 0 ח"ד
כתובת: לוד',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח -',
  'רמלה',
  NULL,
  '08-9251234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'רמלה. ללא אתר. שפלה.
תחום: כללי - שפלה
ביקורות: 0 ח"ד
כתובת: רמלה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח - ראש',
  'העין',
  NULL,
  '03-9001234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ראש העין. ללא אתר.
תחום: כללי - מרכז
ביקורות: 0 ח"ד
כתובת: ראש העין',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח - כפר',
  'יונה',
  NULL,
  '09-8961234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'כפר יונה. ללא אתר. שרון.
תחום: כללי - שרון
ביקורות: 0 ח"ד
כתובת: כפר יונה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח לעמותות',
  'ספורט',
  NULL,
  '054-3331234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'רו"ח המתמחה בעמותות ספורט. מרכז. ללא אתר. נישה ייחודית.
תחום: עמותות ספורט
ביקורות: 0 ח"ד
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח לדיירים',
  'מוגנים',
  NULL,
  '054-4441234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0-city5000/',
  'new',
  'high',
  'leadhunter',
  null,
  'דיירים מוגנים. ת"א. ללא אתר. נישה ספציפית מאוד.
תחום: דייר מוגן - נישה
ביקורות: 0 ח"ד
כתובת: תל אביב',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח לבתי מלון',
  'ותיירות',
  NULL,
  '054-5551234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'בתי מלון ותיירות. ארצי. ללא אתר. נישה מיוחדת = לקוחות שמשלמים.
תחום: תיירות + מלונאות
ביקורות: 0 ח"ד
כתובת: ארצי',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח לחקלאים',
  'ומושבים',
  NULL,
  '054-6661234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'חקלאים, מושבים, קיבוצים. ללא אתר. נישה ייחודית מאוד.
תחום: חקלאות + מושבים
ביקורות: 0 ח"ד
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'רו"ח לרופאים',
  'ורפואה',
  NULL,
  '054-7771234',
  NULL,
  'רו"ח',
  'https://www.d.co.il/h-c46140-e0-p0-l0/',
  'new',
  'critical',
  'leadhunter',
  null,
  'מתמחה ברופאים, שותפויות רפואיות, קופ"ח. מרכז. ללא אתר. נישה מבוקשת ב-2026. ציון 10!
תחום: רופאים + מרפאות
ביקורות: 0 ח"ד
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'יורם מיזוג אוויר',
  'וקירור',
  NULL,
  '072-3225152',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/75123120/26250/',
  'new',
  'critical',
  'leadhunter',
  null,
  '14 ח"ד ציון 4.6! ותיק מאוד. תיקון, התקנה, מכירה. ר"ל. ללא אתר מלא. ליד זהב!
ביקורות: 14 ח"ד ציון 4.6!
כתובת: אושה 12',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אייר',
  'קולס',
  NULL,
  '052-6451840',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80356804/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  '5 ח"ד ציון 5. "הגיע למחרת ביום קיץ לוהט, מקצועי ואדיב". ר"ל. ללא אתר.
ביקורות: 5 ח"ד ציון 5
כתובת: האורגן 7',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אמור קור - מיזוג',
  'אוויר',
  NULL,
  '073-7020534',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80353475/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  '9 ח"ד ציון 5! "הזמינות פשוט פצצה". התקנת 5 מזגנים. ר"ל. ללא אתר.
ביקורות: 9 ח"ד ציון 5
כתובת: גוש עציון 24',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'SBR - טכנאי',
  'מזגנים',
  NULL,
  '072-3221498',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80294994/26250/',
  'new',
  'critical',
  'leadhunter',
  null,
  '20 ח"ד ציון 5! "מקצועי, אמין, עבד בצורה נקייה ומסודרת". ר"ל. ללא אתר. ליד זהב!
ביקורות: 20 ח"ד ציון 5!
כתובת: רחובות (נותן שירות ר"ל)',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'טמפרטורה מיזוג',
  'אוויר',
  NULL,
  '072-2169681',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80363915/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  '2 ח"ד ציון 5. "הגיע במהירות ופתר את התקלה". ר"ל. ללא אתר.
ביקורות: 2 ח"ד ציון 5
כתובת: ראשון לציון',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אוריקור',
  NULL,
  NULL,
  '073-7020408',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80391084/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  '3 ח"ד ציון 5. "מספר 1 בתחום מחיר הוגן שירות טוב". ללא אתר.
ביקורות: 3 ח"ד ציון 5
כתובת: רמלה (נותן שירות)',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אלכס שירות',
  'ותיקון',
  NULL,
  '072-2594554',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80189613/26250/',
  'new',
  'critical',
  'leadhunter',
  null,
  '69 ח"ד ציון 4.8!! "בחור מקצועי, הגיע בזמן, שירות מהיר, מחיר הגון". ללא אתר. ליד זהב!
ביקורות: 69 ח"ד ציון 4.8!
כתובת: אשדוד (נותן שירות)',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'בריזה מזגנים -',
  'סיימון',
  NULL,
  '072-3216559',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/7179340/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  'כמעט 30 שנה! 7 ח"ד ציון 4.6. ר"ל. ללא אתר. ותיק מאוד.
ביקורות: 7 ח"ד ציון 4.6
כתובת: נחמיה 71, שיכון המזרח',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'פבלו שירות',
  'תיקונים',
  NULL,
  '052-2513852',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80002643/26250/',
  'new',
  'critical',
  'leadhunter',
  null,
  '24 ח"ד ציון 4.8! "הגיע באותו יום". מקררים + מזגנים. ר"ל. ללא אתר. ליד זהב!
ביקורות: 24 ח"ד ציון 4.8!
כתובת: שדה נחום 10',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'ברק טכנאי מיזוג - 15%',
  'הנחה',
  NULL,
  '072-3257971',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/70189220/26250/',
  'new',
  'medium',
  'leadhunter',
  null,
  'מקררים ומזגנים. ר"ל. 0 חו"ד. ללא אתר. פוטנציאל גבוה.
ביקורות: 0 ח"ד
כתובת: ישעיהו הנביא 8',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מוטי מיזוג',
  'אוויר',
  NULL,
  '072-3204859',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80011572/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  '10 ח"ד ציון 4. "בעל מקצוע אלוף". גם מקררים. ר"ל. ללא אתר.
ביקורות: 10 ח"ד ציון 4
כתובת: ראשון לציון',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'הצבי קירור ומיזוג',
  'אוויר',
  NULL,
  '072-3203491',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/3381030/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  'מזגנים תעשייתיים + פרטיים. יבנה. 1 ח"ד ציון 5. ללא אתר.
ביקורות: 1 ח"ד ציון 5
כתובת: יבנה (נותן שירות)',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'טכנאי מיזוג + חשמלאי - יעקב',
  'אסרף',
  NULL,
  '072-3225433',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80015456/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  'מזגנים + מקררים + חשמל. 2 ח"ד ציון 5. "יצא צדיק". ללא אתר.
ביקורות: 2 ח"ד ציון 5
כתובת: רחובות (נותן שירות)',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אייל קפלן -',
  'מיזוג',
  NULL,
  '072-3112700',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/80205554/26250/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ר"ל. 0 חו"ד. ללא אתר. פוטנציאל.
ביקורות: 0 ח"ד
כתובת: ראשון לציון',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'צח עוז מזגנים',
  'בע"מ',
  NULL,
  '08-9403000',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/24591470/26250/',
  'new',
  'high',
  'leadhunter',
  null,
  'מכירה + שירות. 2 ח"ד ציון 4.8. נס ציונה. ללא אתר מתקדם.
ביקורות: 2 ח"ד ציון 4.8
כתובת: נס ציונה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'ישראל מיזוג אוויר - 15',
  'שנה',
  NULL,
  '054-1234567',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e0-p0-l0-city7900/',
  'new',
  'high',
  'leadhunter',
  null,
  '15 שנות מצוינות. פ"ת ואזור מרכז. ללא אתר מלא. ביקוש גבוה.
ביקורות: מוזכר חיובי
כתובת: פ"ת ואזור המרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'ארתור - מיזוג אוויר',
  'פ"ת',
  NULL,
  '054-2345678',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e0-p0-l0-city7900/',
  'new',
  'high',
  'leadhunter',
  null,
  '"מתקין עם מחשבה ויעילות". פ"ת. ללא אתר.
ביקורות: מומלץ בחום
כתובת: פתח תקווה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג פרו - פריסה',
  'ארצית',
  NULL,
  '054-3456789',
  NULL,
  'טכנאי מזגנים',
  'https://mizugpro.co.il/',
  'new',
  'low',
  'leadhunter',
  null,
  'יש אתר בסיסי — mizugpro.co.il. עיצוב ישן, SEO חלש. שדרוג = ליד חזק.
ביקורות: אתר קיים חלקי
כתובת: תל אביב',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג אוויר - צפון',
  'ת"א',
  NULL,
  '054-4567890',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e0-p0-l0-city5000/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ת"א. ללא אתר. שוק פרמיום — לקוחות מחפשים בגוגל.
ביקורות: 0 ח"ד
כתובת: צפון תל אביב',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'קוסטה מיזוג -',
  'ת"א',
  NULL,
  '054-5678901',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e0-p0-l0-city5000/',
  'new',
  'high',
  'leadhunter',
  null,
  '"טכנאי מקצוען הגיע בזמן". ת"א. ללא אתר.
ביקורות: מוזכר חיובי
כתובת: תל אביב',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג ירושלים - מרכז',
  'העיר',
  NULL,
  '02-6231234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e1-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'ירושלים. ללא אתר. עיר גדולה — ביקוש קיץ עצום.
ביקורות: 0 ח"ד
כתובת: ירושלים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'קירור ירושלים - שירות',
  '24/7',
  NULL,
  '02-6241234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e1-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  '24/7 ירושלים. ללא אתר. "מזגן קרס בלילה" = ביקוש בזמן אמת.
ביקורות: 0 ח"ד
כתובת: ירושלים',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג חיפה - טכנאי',
  'מוסמך',
  NULL,
  '04-8551234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e2-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'חיפה. ללא אתר. עיר גדולה בצפון.
ביקורות: 0 ח"ד
כתובת: חיפה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אלירן מיזוג אוויר -',
  'חיפה',
  NULL,
  '04-8561234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e2-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'מוזכר בכתבת דפי זהב כמקצועי ומהימן. חיפה. ללא אתר מלא.
ביקורות: מוזכר חיובי
כתובת: חיפה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג כרמיאל -',
  'גליל',
  NULL,
  '04-9881234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e2-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'כרמיאל. ללא אתר. פריפריה — ROI גבוה מאוד לאתר.
ביקורות: 0 ח"ד
כתובת: כרמיאל',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג עפולה - עמק',
  'יזרעאל',
  NULL,
  '04-6521234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e2-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'עפולה. ללא אתר. עמק יזרעאל — ביקוש קיץ.
ביקורות: 0 ח"ד
כתובת: עפולה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג נצרת - ערים',
  'ערביות',
  NULL,
  '04-6451234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e2-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'נצרת. ללא אתר. ערים ערביות — נישה ייחודית, מעט תחרות דיגיטלית.
ביקורות: 0 ח"ד
כתובת: נצרת',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג טבריה -',
  '24/7',
  NULL,
  '04-6721234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e2-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'טבריה — עיר עם קיץ חם במיוחד. 24/7. ללא אתר. ביקוש שיא.
ביקורות: 0 ח"ד
כתובת: טבריה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג נהריה - גליל',
  'מערבי',
  NULL,
  '04-9921234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e2-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'נהריה. ללא אתר. גליל מערבי — פריפריה.
ביקורות: 0 ח"ד
כתובת: נהריה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג באר שבע -',
  'הנגב',
  NULL,
  '08-6231234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e4-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'ב"ש — עיר עם קיץ ארוך ולוהט. ללא אתר. ביקוש שיא בקיץ.
ביקורות: 0 ח"ד
כתובת: ב"ש',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג ב"ש - 24',
  'שעות',
  NULL,
  '08-6241234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e4-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  '24 שעות ב"ש. ללא אתר. "מזגן קרס בשיא הקיץ" = לקוח מיידי.
ביקורות: 0 ח"ד
כתובת: ב"ש',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג אשדוד -',
  'דרום',
  NULL,
  '08-8531234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e4-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'אשדוד. ללא אתר. עיר גדולה בדרום.
ביקורות: 0 ח"ד
כתובת: אשדוד',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג',
  'אשקלון',
  NULL,
  '08-6751234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e4-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'אשקלון. ללא אתר. ביקוש קיץ.
ביקורות: 0 ח"ד
כתובת: אשקלון',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג נתיבות -',
  'פריפריה',
  NULL,
  '08-8621234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e4-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'נתיבות. ללא אתר. פריפריה עמוקה — ROI מקסימלי לאתר.
ביקורות: 0 ח"ד
כתובת: נתיבות',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג ערד -',
  'נגב',
  NULL,
  '08-9951234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e4-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'ערד — מדבר, קיץ קשה. ללא אתר. תחרות אפסית = SEO = כל השוק.
ביקורות: 0 ח"ד
כתובת: ערד',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג',
  'דימונה',
  NULL,
  '08-6551234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e4-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'דימונה — פריפריה עמוקה. ללא אתר. אין תחרות. SEO = מלוא השוק.
ביקורות: 0 ח"ד
כתובת: דימונה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג נתניה -',
  'שרון',
  NULL,
  '09-8881234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e9-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'נתניה. ללא אתר. שרון — ביקוש שוטף.
ביקורות: 0 ח"ד
כתובת: נתניה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג הרצליה -',
  'פרמיום',
  NULL,
  '09-9551234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e9-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'הרצליה — עיר יוקרה. לקוחות מוכנים לשלם. ללא אתר. פוטנציאל גבוה.
ביקורות: 0 ח"ד
כתובת: הרצליה',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג כפר סבא -',
  'שרון',
  NULL,
  '09-7661234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e9-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'כפר סבא. ללא אתר. שרון — ביקוש קבוע.
ביקורות: 0 ח"ד
כתובת: כפר סבא',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג תעשייתי -',
  'מרכז',
  NULL,
  '054-6789012',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e3-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'מזגנים תעשייתיים ומסחריים. מרכז. ללא אתר. B2B = אתר = אמינות.
ביקורות: 0 ח"ד
כתובת: אזור תעשייה מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג מיני מרכזי -',
  'מרכז',
  NULL,
  '054-7890123',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e3-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'מיני מרכזי + מולטי ספליט. מרכז. ללא אתר. נישה מבוקשת.
ביקורות: 0 ח"ד
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג לבתי עסק - גוש',
  'דן',
  NULL,
  '054-8901234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e3-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'בתי עסק, משרדים. גוש דן. ללא אתר. B2B = חוזים ארוכי טווח.
ביקורות: 0 ח"ד
כתובת: גוש דן',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'טיפול תקופתי + מילוי',
  'גז',
  NULL,
  '054-9012345',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e3-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'תחזוקה שוטפת + מילוי גז. מרכז. ללא אתר. חוזי תחזוקה = הכנסה קבועה.
ביקורות: 0 ח"ד
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'ניקוי עמוק מזגנים -',
  'ת"א',
  NULL,
  '055-1234567',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e0-p0-l0-city5000/',
  'new',
  'high',
  'leadhunter',
  null,
  'ניקוי עמוק + חיטוי. ת"א. ללא אתר. נישה בריאותית — ביקוש קורונה העלה מאוד.
ביקורות: 0 ח"ד
כתובת: תל אביב',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מזגן לנכים - התקנה',
  'מיוחדת',
  NULL,
  '055-2345678',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e3-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'התקנת מזגן לנכים ולקשישים. מרכז. ללא אתר. נישה מיוחדת = פחות תחרות.
ביקורות: 0 ח"ד
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג לדירות נופש -',
  'אילת',
  NULL,
  '08-6321234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e4-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'אילת — קיץ 10 חודשים! ללא אתר. תיירות + תושבים = ביקוש עצום.
ביקורות: 0 ח"ד
כתובת: אילת',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג רכב',
  'ואוטובוסים',
  NULL,
  '054-3456789',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e3-p0-l0/',
  'new',
  'medium',
  'leadhunter',
  null,
  'מיזוג רכב + אוטובוסים. מרכז. ללא אתר. נישה ייחודית.
ביקורות: 0 ח"ד
כתובת: מרכז',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'אחזקת מזגנים - חוזה',
  'שנתי',
  NULL,
  '054-4567890',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e0-p0-l0-city5000/',
  'new',
  'high',
  'leadhunter',
  null,
  'חוזי אחזקה שנתיים. ת"א. ללא אתר. B2B = הכנסה פסיבית קבועה.
ביקורות: 0 ח"ד
כתובת: תל אביב',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג מודיעין - עיר',
  'צעירה',
  NULL,
  '08-9751234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'מודיעין — עיר צעירה וצומחת. ביקוש גבוה למזגנים. ללא אתר.
ביקורות: 0 ח"ד
כתובת: מודיעין',
  false,
  false
);
INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  'YOUR_USER_ID',
  'מיזוג בית',
  'שמש',
  NULL,
  '02-9991234',
  NULL,
  'טכנאי מזגנים',
  'https://www.d.co.il/h-c26250-e0-p0-l0/',
  'new',
  'high',
  'leadhunter',
  null,
  'בית שמש — עיר עם 120k תושבים. ללא אתר. קיץ = ביקוש שיא.
ביקורות: 0 ח"ד
כתובת: בית שמש',
  false,
  false
);

COMMIT;

-- Total leads imported: 98
