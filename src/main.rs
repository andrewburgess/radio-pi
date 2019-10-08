use actix_web::{middleware, web, App, HttpServer};
use dotenv::dotenv;

mod spotify;

fn main() {
    dotenv().ok();

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::DefaultHeaders::new().header("X-Version", "0.1.0"))
            .wrap(middleware::Compress::default())
            .wrap(middleware::Logger::default())
            .service(
                web::scope("/api/spotify")
                    .route("/token", web::post().to_async(spotify::token_route))
                    .route("/url", web::get().to(spotify::get_authorize_url)),
            )
    })
    .bind("127.0.0.1:8080")
    .unwrap()
    .run()
    .unwrap();
}
