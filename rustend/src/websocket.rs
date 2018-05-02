
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
    /*
    impl Server {
        fn broadcast(&mut self, msg: String) {
            let id = self.context.id;
            self.others.lock().unwrap()
                .iter().for_each(move |x| {
                if x.id != id {
                    x.ws.send(msg).unwrap();
                }
            });
        }
    }
    */
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
                    "playerInventoryId" => {
                        *self.context.player_inventory_id.write().unwrap() = packet.value.as_i64().unwrap_or(0) as i32;
                    },
                    "gameId" => {
                        *self.context.game_id.write().unwrap() = packet.value.as_i64().unwrap_or(0) as i32;
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

        fn on_close(&mut self, _: CloseCode, _: &str) {
            println!("WSServer {} closing", self.context.id);
            if let Ok(mut servers) = self.others.lock() {
                let id = self.context.id;
                let index = servers.iter().position(|x| x.id == id).unwrap();
                servers.remove(index);
            }
            self.context.ws.shutdown().unwrap()
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
