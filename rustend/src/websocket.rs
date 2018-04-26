
extern crate ws;
use std::thread;
use std::sync::mpsc::channel;
use std::sync::mpsc::Sender as ThreadOut;
use self::ws::{connect, listen, CloseCode, Message, Sender, Handler, Handshake, Result};
use self::ws::Error as WSError;

use std::sync::{Arc, Mutex};

pub struct WSSocketData {
    pub id: i32,
    pub ws: Sender,
}

pub fn start_websocket_server() -> (Arc<Mutex<Vec<Arc<WSSocketData>>>>, thread::JoinHandle<()>) {
    struct Server {
        context: Arc<WSSocketData>,
        others: Arc<Mutex<Vec<Arc<WSSocketData>>>>,
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

            let id = self.context.id;
            self.others.lock().unwrap()
                .iter().for_each(move |x| {
                    if x.id != id {
                        x.ws.send("Pork").unwrap();
                    }
                });

            // echo it back
            self.context.ws.send(msg)
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
    let servers: Arc<Mutex<Vec<Arc<WSSocketData>>>> = Arc::new(Mutex::new(Vec::new()));
    let returned_servers = servers.clone();

    let thread = thread::spawn(move || {
        let mut counter = 0;
        listen("0.0.0.0:3012", move |out| {
            counter += 1;
            let server = Arc::new(WSSocketData {
                id: counter,
                ws: out,
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
