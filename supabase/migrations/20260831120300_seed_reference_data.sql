-- VRK Decor — approved reference data
--
-- Every value below is transcribed from 01_REQUIREMENTS, Website Requirements &
-- Statement of Work: occasions from section 5, services from section 6 (with
-- the partner-vendor markings it specifies), styles from section 8.
-- No business facts are invented here.
--
-- Idempotent: safe to re-run against staging or production.

insert into public.occasions (name, secondary_term, slug, sort_order) values
  ('Wedding',           null,                    'wedding',            10),
  ('Reception',         null,                    'reception',          20),
  ('Engagement',        'Nichayathartham',       'engagement',         30),
  ('Seer Varisai Ceremony', null,                'seer-varisai',       40),
  ('Puberty Ceremony',  'Manjal Neerattu Vizha', 'puberty-ceremony',   50),
  ('Ear-Piercing',      'Kaadhu Kuthu',          'ear-piercing',       60),
  ('Holy Communion',    null,                    'holy-communion',     70),
  ('Baby Shower',       'Valaikappu',            'baby-shower',        80),
  ('Housewarming',      'Gruhapravesam',         'housewarming',       90),
  ('Birthday',          null,                    'birthday',          100),
  ('Anniversary',       null,                    'anniversary',       110),
  ('Corporate Events',  null,                    'corporate-events',  120),
  ('College Events',    null,                    'college-events',    130),
  ('Other Celebrations', null,                   'other-celebrations', 140)
on conflict (slug) do nothing;

insert into public.services (name, slug, delivery_model, sort_order) values
  ('Event & Wedding Decoration',   'event-wedding-decoration',   'in_house',       10),
  ('Stage & Mandap Decoration',    'stage-mandap-decoration',    'in_house',       20),
  ('Floral Decoration',            'floral-decoration',          'in_house',       30),
  ('Entrance Decoration',          'entrance-decoration',        'in_house',       40),
  ('Makeup & Styling',             'makeup-styling',             'partner_vendor', 50),
  ('Sounds & Lightings',           'sounds-lightings',           'partner_vendor', 60),
  ('Photography & Videography',    'photography-videography',    'partner_vendor', 70),
  ('Food & Catering',              'food-catering',              'partner_vendor', 80),
  ('Furniture & Seating',          'furniture-seating',          'in_house',       90),
  ('LED / Display Solutions',      'led-display-solutions',      'partner_vendor', 100),
  ('Return Gifts & Essentials',    'return-gifts-essentials',    'in_house',      110),
  ('Complete Event Management',    'complete-event-management',  'in_house',      120)
on conflict (slug) do nothing;

insert into public.styles (name, slug, sort_order) values
  ('Traditional',       'traditional',       10),
  ('Royal',             'royal',             20),
  ('Floral',            'floral',            30),
  ('Modern',            'modern',            40),
  ('Minimal',           'minimal',           50),
  ('Luxury',            'luxury',            60),
  ('Pastel',            'pastel',            70),
  ('Heritage / Temple', 'heritage-temple',   80),
  ('Colourful',         'colourful',         90),
  ('Contemporary',      'contemporary',     100)
on conflict (slug) do nothing;
