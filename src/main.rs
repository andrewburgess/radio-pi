use dotenv::dotenv;

mod server;
mod spotify;

fn main() {
    dotenv().ok();

    server::start_server();
}
