
use super::super::{
    DbConn,
    models,
    models::*,
    diesel::dsl::sql,
    diesel::prelude::*,
    diesel::sql_types::{Nullable, Text, Integer},
    schema::inventory_item::dsl as ii,
    schema::template_item::dsl as ti,
};

sql_function!(fn coalesce(x: Nullable<Text>, y: Text) -> Text);

macro_rules! inventory_item_select {() => {
    inventory_item::table
        .inner_join(template_item::table)
        /*
        .select(sql("\
            inventory_item.id, \
            inventory_item.template_id, \
            coalesce(inventory_item.name, template_item.name),\
            coalesce(inventory_item.public_description, template_item.public_description),\
            coalesce(inventory_item.mechanical_description, template_item.mechanical_description),\
            coalesce(inventory_item.hidden_description, template_item.hidden_description),\
            coalesce(inventory_item.price, template_item.price),\
            coalesce(inventory_item.width, template_item.width),\
            coalesce(inventory_item.height, template_item.height),\
            coalesce(inventory_item.image_url, template_item.image_url)\
         "))
         */
        .select((
            ii::id,
            ii::template_id,
            ii::inventory_id,
            coalesce(ii::name, ti::name),
            coalesce(ii::public_description, ti::public_description),
            coalesce(ii::mechanical_description, ti::mechanical_description),
            coalesce(ii::hidden_description, ti::hidden_description),
            ii::visible_mechanical,
            ii::visible_private,
            sql("coalesce(inventory_item.price, template_item.price)"),
            sql("coalesce(inventory_item.width, template_item.width)"),
            sql("coalesce(inventory_item.height, template_item.height)"),
            ii::x,
            ii::y,
            //coalesce_i32(ii::price, 3),
            //coalesce_i32(ii::width, 3),
            //coalesce_i32(ii::height, 3),
            coalesce(ii::image_url, ti::image_url),
        ))
        .group_by((inventory_item::id, template_item::id))
}}

impl models::InventoryItem {
    pub fn load(conn: DbConn, inv_item_id: i32) -> QueryResult<InventoryItem> {
        inventory_item_select!()
            .filter(inventory_item::id.eq(inv_item_id))
            .get_result(&*conn)
    }
    pub fn index(conn: DbConn) -> QueryResult<Vec<InventoryItem>> {
        inventory_item_select!()
            .get_results(&*conn)
    }
    pub fn get_in_inventory(conn: &DbConn, inv_id: i32) -> QueryResult<Vec<InventoryItem>> {
        inventory_item_select!()
            .filter(inventory_item::inventory_id.eq(inv_id))
            .get_results(&**conn)
    }
}
