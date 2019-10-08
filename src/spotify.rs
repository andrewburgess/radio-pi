use actix_web::client::{Client, SendRequestError};
use actix_web::{web, Error, HttpResponse, Responder};
use base64::encode;
use futures::future::{ok, Future};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;

#[derive(Deserialize)]
pub struct AuthorizeUrlQuery {
    redirect_uri: String,
}

#[derive(Serialize)]
pub struct AuthorizeUrl {
    url: String,
}

#[derive(Deserialize)]
pub struct ClientGetTokenRequest {
    code: String,
    redirect_uri: String,
}

#[derive(Serialize)]
struct GetNewAuthorizationToken {
    code: String,
    grant_type: String,
    redirect_uri: String,
}

#[derive(Serialize)]
struct RefreshAuthorizationToken {
    grant_type: String,
    refresh_token: String,
}

pub fn get_authorize_url(query: web::Query<AuthorizeUrlQuery>) -> impl Responder {
    let client_id = match env::var("SPOTIFY_CLIENT_ID") {
        Ok(id) => id,
        Err(e) => panic!("SPOTIFY_CLIENT_ID is not specified: {}", e),
    };

    let scopes = vec![
        "streaming",
        "user-modify-playback-state",
        "user-read-birthdate",
        "user-read-email",
        "user-read-private",
    ];
    let scopes = scopes.join("%20");

    HttpResponse::Ok().json(AuthorizeUrl {
        url: format!("https://accounts.spotify.com/authorize?response_type=code&client_id={}&scope={}&redirect_uri={}", client_id, scopes, query.redirect_uri)
    })
}

pub fn token_route(
    body: web::Json<ClientGetTokenRequest>,
) -> impl Future<Item = HttpResponse, Error = Error> {
    let body = GetNewAuthorizationToken {
        code: body.code.clone(),
        grant_type: "authorization_code".to_string(),
        redirect_uri: body.redirect_uri.clone(),
    };

    let client = Client::new();

    client
        .post("https://accounts.spotify.com/api/token")
        .header("authorization", get_authorization())
        .header("content-type", "application/x-www-form-urlencoded")
        .send_form(&body)
        .map_err(Error::from)
        .and_then(|mut response| {
            response.body().from_err().and_then(|body| {
                println!("{}", String::from_utf8(body.to_vec()).unwrap());

                Ok(HttpResponse::Ok().body("cool"))
            })
        })
}

fn get_authorization() -> String {
    let client_id = env::var("SPOTIFY_CLIENT_ID").unwrap();
    let client_secret = env::var("SPOTIFY_CLIENT_SECRET").unwrap();

    let authorization = format!("Basic {}:{}", client_id, client_secret);

    encode(&authorization).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;
}
