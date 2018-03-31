use super::schema::item;

#[derive(Queryable, Identifiable, AsChangeset, Serialize, Deserialize, Debug)]
#[primary_key(id)]
#[table_name = "item"]
pub struct Item {
    pub id: i32,
    pub name: String,
    pub price: i32,
    pub description: String,
}

#[derive(Insertable, Serialize, Deserialize, Debug)]
#[table_name = "item"]
pub struct NewItem {
    pub name: String,
    pub price: i32,
    pub description: String,
}
