# RADIO PI

Spotify in a real radio.

# Getting Started

Make sure you have [node](https://nodejs.org) installed, then

```
$ npm install
```

This project relies on a few environmental variables, which you can
define in a `.env` file

```
REACT_APP_SPOTIFY_CLIENT_ID
REACT_APP_SPOTIFY_CLIENT_SECRET
```

These values can be obtained by creating a Spotify app at
https://developer.spotify.com/dashboard/applications

Once set up, you can run

```
$ npm run electron-dev
```

to launch the system in development mode. Note that some aspects are
dependent on running on a Raspberry PI with specific GPIO inputs