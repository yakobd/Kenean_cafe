-- ============================================================
-- ከነአን Café — Seed Data
-- ============================================================

-- ─── Categories (4) ────────────────────────────────────────
insert into categories (id, name, name_amharic, display_order) values
  ('00000000-0000-0000-0000-000000000001', 'Coffee',    'ቡና',      1),
  ('00000000-0000-0000-0000-000000000002', 'Breakfast', 'ቁርስ',     2),
  ('00000000-0000-0000-0000-000000000003', 'Pastry',    'ኬክ',      3),
  ('00000000-0000-0000-0000-000000000004', 'Drinks',    'መጠጦች',   4);

-- ─── Menu Items (10, mapped from data/menu.ts) ─────────────
insert into menu_items (id, category_id, name, description, price, image_url, is_available) values
  -- Coffee
  (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Espresso',
    'Rich and bold single shot',
    45.00,
    'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Cappuccino',
    'Espresso with steamed milk foam',
    65.00,
    'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Latte',
    'Smooth espresso with steamed milk',
    70.00,
    'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=400&fit=crop',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Macchiato',
    'Espresso marked with foam',
    55.00,
    'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400&h=400&fit=crop',
    true
  ),
  -- Breakfast
  (
    '00000000-0000-0000-0001-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'Avocado Toast',
    'Sourdough with fresh avocado',
    120.00,
    'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&h=400&fit=crop',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000006',
    '00000000-0000-0000-0000-000000000002',
    'Eggs Benedict',
    'Poached eggs with hollandaise',
    150.00,
    'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&h=400&fit=crop',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000007',
    '00000000-0000-0000-0000-000000000002',
    'Pancakes',
    'Fluffy pancakes with maple syrup',
    110.00,
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
    true
  ),
  -- Pastry
  (
    '00000000-0000-0000-0001-000000000008',
    '00000000-0000-0000-0000-000000000003',
    'Croissant',
    'Buttery French pastry',
    50.00,
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000009',
    '00000000-0000-0000-0000-000000000003',
    'Chocolate Muffin',
    'Rich chocolate chip muffin',
    60.00,
    'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000010',
    '00000000-0000-0000-0000-000000000003',
    'Cinnamon Roll',
    'Warm cinnamon with cream cheese',
    70.00,
    'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?w=400&h=400&fit=crop',
    true
  );

-- ─── Config ────────────────────────────────────────────────
insert into config (key, value) values
  ('bank_name',           'Commercial Bank of Ethiopia'),
  ('account_number',      '1000420841632'),
  ('account_holder_name', 'Yakob Dereje Negash'),
  ('currency_symbol',     'ብር'),
  ('cafe_name',           'ከነአን Café');
