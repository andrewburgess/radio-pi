use base64::encode;
use serde::Serialize;
use std::env;

#[derive(Debug, Serialize)]
pub struct AuthorizeUrl {
    url: String,
}

pub fn get_authorize_url(redirect_uri: &str) -> AuthorizeUrl {
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

    AuthorizeUrl {
        url: format!("https://accounts.spotify.com/authorize?response_type=code&client_id={}&scope={}&redirect_uri={}", client_id, scopes, &redirect_uri)
    }
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
