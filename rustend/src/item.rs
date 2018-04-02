use diesel;
use diesel::prelude::*;
use DbConn;

use models::*;
use schema::template_item;

use rocket::response::status;
use rocket_contrib::Json;

#[get("/")]
fn index(conn: DbConn) -> QueryResult<Json<Vec<TemplateItem>>>
{
    let item_request = template_item::table.load(&*conn)?;
    Ok(Json(item_request))
}

#[derive(FromForm)]
struct SearchParams {
    name: Option<String>,
}

#[get("/?<params>")]
fn search(conn: DbConn, params: SearchParams) -> QueryResult<Json<Vec<TemplateItem>>>
{
    //let params = params.unwrap();
    let mut sql = template_item::table.into_boxed();
    if let Some(name) = params.name {
        sql = sql.filter(template_item::dsl::name.like(format!("%{}%", name)));
    }
    let item_request = sql.load(&*conn)?;
    Ok(Json(item_request))
}

#[get("/<item_id>")]
fn get(item_id: i32, conn: DbConn) -> Option<Json<TemplateItem>>
{
    if let Ok(result) = template_item::table.find(item_id).get_result(&*conn) {
        Some(Json(result))
    } else {
        None
    }
}

#[post("/", data = "<new_item>")]
fn create(conn: DbConn, new_item: Json<NewTemplateItem>) -> QueryResult<Json<TemplateItem>>
{
    diesel::insert_into(template_item::table)
        .values(&new_item.into_inner())
        .get_result::<TemplateItem>(&*conn)
        .map(|p| Json(p))
}

#[patch("/<item_id>", data = "<new_item>")]
fn update(conn: DbConn, item_id: i32, new_item: Json<NewTemplateItem>) -> QueryResult<Json<TemplateItem>>
{
    assert!(item_id > 0);
    diesel::update(template_item::table.find(item_id))
        .set(&new_item.into_inner())
        .get_result::<TemplateItem>(&*conn)
        .map(|p| Json(p))
}

#[delete("/<item_id>")]
fn delete(conn: DbConn, item_id: i32) -> Result<status::NoContent, diesel::result::Error>
{
    assert!(item_id > 0);
    diesel::delete(template_item::table.find(item_id))
        .execute(&*conn)?;
    Ok(status::NoContent)
}

#[cfg(test)]
mod test {
    use super::super::rocket;
    use rocket::local::Client;
    use rocket::http::{Status, ContentType};
    use super::{Json, TemplateItem, NewTemplateItem};
    use serde_json;

    #[test]
    fn create() {
        let client = Client::new(rocket(true)).expect("valid rocket instance");
        let mut response = client.post("/item")
            .body(serde_json::to_string(&NewTemplateItem {
                name: "test item".to_string(),
                price: 4,
                public_description: "test desc".to_string(),
                ..NewTemplateItem::default()
            }).unwrap())
            .header(ContentType::JSON)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        let mut item: TemplateItem = serde_json::from_str(&response.body_string().unwrap()).unwrap();
        assert!(item.id > 0);
        assert_eq!(item.name, "test item");
        assert_eq!(item.price, 4);
        assert_eq!(item.public_description, "test desc");

        item.name = "test item 2".to_string();
        let mut response = client.patch(format!("/item/{}", item.id))
            .body(serde_json::to_string(&item).unwrap())
            .header(ContentType::JSON)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        let item2: TemplateItem = serde_json::from_str(&response.body_string().unwrap()).unwrap();
        assert_eq!(item.id, item2.id);
        assert_eq!(item2.name, "test item 2");

        let response = client.delete(format!("/item/{}", item2.id))
            .dispatch();
        assert_eq!(response.status(), Status::NoContent);
    }
}
