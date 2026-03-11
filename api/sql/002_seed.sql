INSERT OR IGNORE INTO salons (id, slug, name, city, tagline, logo_url, cover_url, created_at)
VALUES (
  'salon_aurora',
  'aurora',
  'Salão Aurora',
  'Pelotas - RS',
  'Cortes modernos, luz natural e experiência premium.',
  NULL,
  NULL,
  datetime('now')
);

INSERT OR IGNORE INTO services (id, salon_id, name, duration_minutes, price_cents, active, sort_order)
VALUES
  ('svc_corte', 'salon_aurora', 'Corte masculino', 45, 6500, 1, 1),
  ('svc_barba', 'salon_aurora', 'Barba completa', 30, 4500, 1, 2),
  ('svc_combo', 'salon_aurora', 'Combo corte + barba', 70, 9800, 1, 3),
  ('svc_trat', 'salon_aurora', 'Tratamento capilar', 50, 7200, 1, 4);

INSERT OR IGNORE INTO staff (id, salon_id, name, role, active)
VALUES
  ('staff_livia', 'salon_aurora', 'Livia Costa', 'Master barber', 1),
  ('staff_rafa', 'salon_aurora', 'Rafael Nunes', 'Estilista', 1),
  ('staff_maya', 'salon_aurora', 'Maya Duarte', 'Manicure', 1);

INSERT OR IGNORE INTO loyalty_rules (id, salon_id, mode, points_per_service, target_points, reward_description, config_json, created_at)
VALUES (
  'loyalty_aurora',
  'salon_aurora',
  'simple',
  1,
  10,
  'Ganhe 1 ponto por corte. A cada 10, um serviço grátis.',
  NULL,
  datetime('now')
);
