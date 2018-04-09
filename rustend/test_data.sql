DELETE FROM inventory_item WHERE id = 9000 or template_id = 9000 or inventory_id=9000;
DELETE FROM template_item WHERE id = 9000;

DELETE FROM inventory WHERE id=9000;
INSERT INTO inventory (id, name, width, height)
    VALUES (9000, 'test inv', 8, 8);

INSERT INTO template_item (id, name, public_description, mechanical_description, hidden_description, price, width, height, image_url)
    VALUES (9000, 'test item', 'pub desc', 'mech desc', 'hidden desc', 3, 4, 5, 'url here');
INSERT INTO inventory_item (id, template_id, inventory_id, name, width, x, y)
    VALUES (9000, 9000, 9000, 'test item override', 42, 1, 1);
