use futures::future;
use futures::future::Future;
use hyper::service::service_fn;
use hyper::{Body, Method, Request, Response, Server, StatusCode};
use qstring::QString;
use serde_json;

use self::super::spotify;

type ResponseFuture = Box<dyn Future<Item = Response<Body>, Error = hyper::Error> + Send>;

fn ping(_req: Request<Body>) -> ResponseFuture {
    Box::new(future::ok(
        Response::builder()
            .status(StatusCode::OK)
            .body(Body::from("pong"))
            .unwrap(),
    ))
}

fn get_spotify_authorize_url(req: Request<Body>) -> ResponseFuture {
    let qs = QString::from(req.uri().query().unwrap());
    let data = spotify::get_authorize_url(qs.get("redirect_uri").unwrap());

    Box::new(future::ok(
        Response::builder()
            .status(StatusCode::OK)
            .header("content-type", "application/json")
            .body(Body::from(serde_json::to_string(&data).unwrap()))
            .unwrap(),
    ))
}

fn router(req: Request<Body>) -> ResponseFuture {
    match (req.method(), req.uri().path()) {
        (&Method::GET, "/api/spotify/url") => get_spotify_authorize_url(req),
        (&Method::GET, "/ping") => ping(req),
        _ => {
            let body = Body::from("Not found");
            Box::new(future::ok(
                Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body(body)
                    .unwrap(),
            ))
        }
    }
}

pub fn start_server() {
    let addr = ([127, 0, 0, 1], 8080).into();

    let server = Server::bind(&addr)
        .serve(|| service_fn(router))
        .map_err(|err| eprintln!("server error: {}", err));
    hyper::rt::run(server);
}
