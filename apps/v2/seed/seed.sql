-- Seed data — idempotent. Run with:
--   pnpm db:seed         (against local D1)
--   pnpm db:seed:prod    (against production D1)
--
-- Inserts:
--   * 12 achievement definitions
--   * 6 sample rewards
--
-- Does NOT seed users — register via /register, then promote via:
--   wrangler d1 execute heroquest --local \
--     --command="UPDATE user_profile SET role='admin' \
--       WHERE user_id=(SELECT id FROM user WHERE email='baramee1407@gmail.com');"

-- ===== Achievements =====
INSERT OR IGNORE INTO achievement (id, name, name_en, description, description_en, icon) VALUES
  ('first-quest',        'ภารกิจแรก',                'First Quest',         'ทำภารกิจดี ๆ ครั้งแรกสำเร็จ',                    'Complete your very first good deed.',   'Sparkles'),
  ('quest-enthusiast',   'นักผจญภัยตัวจริง',          'Quest Enthusiast',    'ทำภารกิจสำเร็จ 5 ครั้ง',                          'Complete 5 approved quests.',           'Compass'),
  ('legendary-hero',     'วีรบุรุษในตำนาน',           'Legendary Hero',      'ทำภารกิจสำเร็จ 20 ครั้ง',                        'Complete 20 approved quests.',          'Crown'),
  ('xp-novice',          'ผู้กล้าน้อย',               'XP Novice',           'เก็บ XP ได้ 100 คะแนน',                          'Earn 100 XP.',                          'Star'),
  ('xp-master',          'ปรมาจารย์ XP',             'XP Master',           'เก็บ XP ได้ 1,000 คะแนน',                        'Earn 1,000 XP.',                        'Award'),
  ('xp-grandmaster',     'มหาเซียน XP',              'XP Grandmaster',      'เก็บ XP ได้ 5,000 คะแนน',                        'Earn 5,000 XP.',                        'Trophy'),
  ('earth-guardian',     'ผู้พิทักษ์โลก',             'Earth Guardian',      'ทำภารกิจหมวดสิ่งแวดล้อมสำเร็จ 3 ครั้ง',           'Complete 3 environment quests.',        'Leaf'),
  ('animal-friend',      'มิตรของสัตว์',              'Animal Friend',       'ทำภารกิจหมวดสัตว์สำเร็จ 3 ครั้ง',                'Complete 3 animal quests.',             'PawPrint'),
  ('community-pillar',   'เสาหลักของชุมชน',           'Community Pillar',    'ทำภารกิจหมวดชุมชนสำเร็จ 5 ครั้ง',                'Complete 5 community quests.',          'Users'),
  ('book-worm',          'หนอนหนังสือ',              'Book Worm',           'ทำภารกิจหมวดการศึกษาสำเร็จ 3 ครั้ง',              'Complete 3 education quests.',          'BookOpen'),
  ('health-hero',        'ฮีโร่สุขภาพ',               'Health Hero',         'ทำภารกิจหมวดสุขภาพสำเร็จ 3 ครั้ง',                'Complete 3 health quests.',             'Heart'),
  ('jack-of-all-deeds',  'ผู้เชี่ยวชาญรอบด้าน',         'Jack of All Deeds',   'ทำภารกิจครบทุกหมวด',                            'Complete at least one quest per category.', 'Medal');

-- ===== Sample rewards =====
INSERT OR IGNORE INTO reward (id, name, name_en, description, description_en, cost, image_url, active) VALUES
  ('rw-sticker',     'สติ๊กเกอร์ฮีโร่',          'Hero Sticker Pack',     'ชุดสติ๊กเกอร์ลายฮีโร่ 5 ดวง',                'A pack of 5 hero stickers.',                          50,  'https://placehold.co/240?text=Stickers',     1),
  ('rw-icecream',    'ไอศกรีม 1 ลูก',           '1 Ice Cream',           'ไอศกรีมโคนหนึ่งลูก',                       'One ice-cream cone from the freezer.',                80,  'https://placehold.co/240?text=Ice+Cream',    1),
  ('rw-movie',       'หนังในบ้าน 1 เรื่อง',         'Movie Night',           'คืนภาพยนต์ในบ้าน 1 เรื่อง',                  'Pick the family movie for movie night.',              150, 'https://placehold.co/240?text=Movie',        1),
  ('rw-toy',         'ของเล่นเล็ก ๆ',           'Small Toy',             'ของเล่นเล็ก ๆ ที่เลือกเอง',                    'Pick out a small toy.',                                250, 'https://placehold.co/240?text=Small+Toy',    1),
  ('rw-bedtime',     'นอนดึก 30 นาที',           'Late Bedtime (30 min)', 'นอนดึกเป็นพิเศษ 30 นาที',                  'Stay up 30 minutes past your bedtime, one night.',    100, 'https://placehold.co/240?text=Bedtime',      1),
  ('rw-trip',        'เดินทางออกไปเที่ยว',         'Day Trip',              'เดินทางออกไปเที่ยวกับครอบครัว',                'A small family day trip of your choosing.',           500, 'https://placehold.co/240?text=Day+Trip',     1);
