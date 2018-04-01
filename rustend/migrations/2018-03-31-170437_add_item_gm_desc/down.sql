DROP TABLE inventory_item;
DROP TABLE template_item;
CREATE TABLE item (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT NOT NULL
)
