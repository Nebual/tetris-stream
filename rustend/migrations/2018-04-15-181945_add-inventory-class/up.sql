ALTER TABLE inventory
  ALTER COLUMN width SET DEFAULT 10,
  ALTER COLUMN width SET DEFAULT 4,
  ADD COLUMN class TEXT NOT NULL DEFAULT 'chest'
;
UPDATE inventory set class='player' WHERE name not in ('test inv', 'A Box');
