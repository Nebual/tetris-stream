DROP TABLE item;
CREATE TABLE template_item (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  public_description TEXT NOT NULL DEFAULT '',
  mechanical_description TEXT NOT NULL DEFAULT '',
  hidden_description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT ''
);
CREATE TABLE inventory_item (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES template_item (id),

  name TEXT,
  public_description TEXT,
  mechanical_description TEXT,
  hidden_description TEXT,
  price INTEGER,
  width INTEGER,
  height INTEGER,
  image_url TEXT
);
