use super::schema::{
    template_item,
    inventory_item,
};

#[derive(Queryable, Identifiable, Serialize, Deserialize, Debug)]
#[primary_key(id)]
#[table_name = "template_item"]
pub struct TemplateItem {
    pub id: i32,
    pub name: String,
    pub public_description: String,
    pub mechanical_description: String,
    pub hidden_description: String,
    pub price: i32,
    pub width: i32,
    pub height: i32,
    pub image_url: String,
}

#[derive(Insertable, AsChangeset, Serialize, Deserialize, Debug, Default)]
#[table_name = "template_item"]
pub struct NewTemplateItem {
    pub name: String,
    pub public_description: String,
    pub mechanical_description: String,
    pub hidden_description: String,
    pub price: i32,
    pub width: i32,
    pub height: i32,
    pub image_url: String,
}


#[derive(Queryable, Identifiable, Serialize, Deserialize, Associations, Debug)]
#[primary_key(id)]
#[belongs_to(TemplateItem, foreign_key = "template_id")]
#[table_name = "inventory_item"]
pub struct InventoryItem {
    pub id: i32,
    pub template_id: i32,
    pub name: String,
    pub public_description: String,
    pub mechanical_description: String,
    pub hidden_description: String,
    pub visible_mechanical: bool,
    pub visible_private: bool,
    pub price: i32,
    pub width: i32,
    pub height: i32,
    pub image_url: String,
}

#[derive(Insertable, AsChangeset, Serialize, Deserialize, Debug, Default)]
#[table_name = "inventory_item"]
pub struct NewInventoryItem {
    pub template_id: i32,
    pub name: Option<String>,
    pub public_description: Option<String>,
    pub mechanical_description: Option<String>,
    pub hidden_description: Option<String>,
    pub visible_mechanical: Option<bool>,
    pub visible_private: Option<bool>,
    pub price: Option<i32>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub image_url: Option<String>,
}
