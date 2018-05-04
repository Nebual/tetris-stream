
extern crate ws;
use std::thread;
use std::sync::mpsc::channel;
use std::sync::mpsc::Sender as ThreadOut;
use self::ws::{connect, listen, CloseCode, Message, Sender, Handler, Handshake, Result};
use self::ws::Error as WSError;

use std::sync::{Arc, Mutex, RwLock};

use super::{serde_derive, serde_json, rocket_contrib};

pub struct WSSocketData {
    pub id: i32,
    pub ws: Sender,
    pub player_inventory_id: RwLock<i32>,
    pub game_id: RwLock<i32>,
    pub subscribed_inventories: RwLock<Vec<i32>>,
}
type WSSocketDataArc = Arc<WSSocketData>;
pub type WSSocketDataMutexVec = Arc<Mutex<Vec<WSSocketDataArc>>>;

#[derive(Deserialize, Debug)]
struct WSPacket {
    action: String,
    value: rocket_contrib::Value,
}

pub fn start_websocket_server() -> (WSSocketDataMutexVec, thread::JoinHandle<()>) {
    struct Server {
        context: WSSocketDataArc,
        others: WSSocketDataMutexVec,
    }
    impl Handler for Server {
        fn on_open(&mut self, _shake: Handshake) -> Result<()> {
            println!("WSServer {} open", self.context.id);
            Ok(())
        }
        fn on_error(&mut self, err: WSError) {
            println!("WSServer {} error {}", self.context.id, err)
        }

        fn on_message(&mut self, msg: Message) -> Result<()> {
            println!("WSServer {} got message '{}'. ", self.context.id, msg);

            let msg = msg.into_text()?;
            if let Ok(packet) = serde_json::from_str::<WSPacket>(&msg) {
                match packet.action.as_ref() {
                    "characterInventoryId" => {
                        *self.context.player_inventory_id.write().unwrap() = packet.value.as_i64().unwrap_or(0) as i32;
                    },
                    "gameId" => {
                        *self.context.game_id.write().unwrap() = packet.value.as_i64().unwrap_or(0) as i32;
                    },
                    "subscribedInventories" => {
                        let vec: Vec<i32> = packet.value.as_array().unwrap().into_iter().map(|value| value.as_i64().unwrap_or(0) as i32).collect();
                        *self.context.subscribed_inventories.write().unwrap() = vec;
                    },
                    action => {
                        println!("Unhandled action {}", action)
                    }
                }
            } else {
                println!("WSServer {} unrecognized packet '{}'", self.context.id, msg);
            }
            Ok(())
        }

        fn on_close(&mut self, close_code: CloseCode, _: &str) {
            let close_code: u16 = close_code.into();
            println!("WSServer {} closing because {}", self.context.id, close_code);
            if let Ok(mut servers) = self.others.lock() {
                let id = self.context.id;
                let index = servers.iter().position(|x| x.id == id).unwrap();
                servers.remove(index);
            }
            self.context.ws.close(CloseCode::Normal).unwrap()
        }
    }
    let servers: WSSocketDataMutexVec = Arc::new(Mutex::new(Vec::new()));
    let returned_servers = servers.clone();

    let thread = thread::spawn(move || {
        let mut counter = 0;
        listen("0.0.0.0:3012", move |out| {
            counter += 1;
            let server = Arc::new(WSSocketData {
                id: counter,
                ws: out,
                player_inventory_id: RwLock::new(0),
                game_id: RwLock::new(0),
                subscribed_inventories: RwLock::new(Vec::new()),
            });
            servers.lock().unwrap().push(server.clone());
            Server {
                context: server,
                others: servers.clone(),
            }
        }).unwrap()
    });
    return (returned_servers, thread);
}
