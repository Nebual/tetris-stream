table! {
    inventory_item (id) {
        id -> Int4,
        template_id -> Int4,
        name -> Nullable<Text>,
        public_description -> Nullable<Text>,
        mechanical_description -> Nullable<Text>,
        hidden_description -> Nullable<Text>,
        price -> Nullable<Int4>,
        width -> Nullable<Int4>,
        height -> Nullable<Int4>,
        image_url -> Nullable<Text>,
    }
}

table! {
    template_item (id) {
        id -> Int4,
        name -> Text,
        public_description -> Text,
        mechanical_description -> Text,
        hidden_description -> Text,
        price -> Int4,
        width -> Int4,
        height -> Int4,
        image_url -> Text,
    }
}

joinable!(inventory_item -> template_item (template_id));

allow_tables_to_appear_in_same_query!(
    inventory_item,
    template_item,
);
