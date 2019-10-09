extern crate futures;
extern crate hex;
extern crate librespot;
#[macro_use]
extern crate neon;
#[macro_use]
extern crate neon_serde;
#[macro_use]
extern crate serde_derive;
extern crate sha1;
extern crate tokio_core;
extern crate tokio_io;
extern crate tokio_process;
extern crate tokio_signal;

use futures::sync::mpsc::UnboundedReceiver;
use futures::{Async, Future, Poll, Stream};
use neon::prelude::*;
use sha1::{Digest, Sha1};
use std::io::{self};
use std::mem;
use tokio_core::reactor::{Core, Handle};
use tokio_io::IoStream;

use librespot::connect::discovery::{discovery, DiscoveryStream};
use librespot::connect::spirc::{Spirc, SpircTask};
use librespot::core::authentication::Credentials;
use librespot::core::config::{ConnectConfig, DeviceType, SessionConfig};
use librespot::core::session::Session;
use librespot::playback::audio_backend::{self, Sink, BACKENDS};
use librespot::playback::config::{Bitrate, PlayerConfig};
use librespot::playback::mixer::{self, Mixer, MixerConfig};
use librespot::playback::player::{Player, PlayerEvent};
use librespot::protocol::authentication::AuthenticationType;

#[derive(Clone)]
struct Setup {
    backend: fn(Option<String>) -> Box<dyn Sink>,
    credentials: Option<Credentials>,
    connect_config: ConnectConfig,
    device: Option<String>,
    enable_discovery: bool,
    mixer: fn(Option<MixerConfig>) -> Box<dyn Mixer>,
    mixer_config: MixerConfig,
    player_config: PlayerConfig,
    player_event_program: Option<String>,
    session_config: SessionConfig,
    zeroconf_port: u16,
}

#[derive(Serialize, Deserialize)]
struct Options {
    token: String,
    username: String,
}

fn device_id(name: &str) -> String {
    hex::encode(Sha1::digest(name.as_bytes()))
}

fn setup(options: Options) -> Setup {
    let backend = audio_backend::find(Option::None).expect("Unknown audio backend");
    let mixer = mixer::find(Some("softvol")).expect("Unknown audio mixer");
    let mixer_config = MixerConfig {
        card: String::from("default"),
        mixer: String::from("PCM"),
        index: 0,
    };

    let name = String::from("Radio PI");
    let credentials = Credentials {
        auth_data: options.token.into_bytes(),
        auth_type: AuthenticationType::AUTHENTICATION_SPOTIFY_TOKEN,
        username: options.username,
    };
    let session_config = {
        let device_id = device_id(&name);

        SessionConfig {
            ap_port: Option::None,
            device_id: device_id,
            proxy: Option::None,
            user_agent: String::from("radio-pi v0.1"),
        }
    };

    let player_config = PlayerConfig {
        bitrate: Bitrate::Bitrate320,
        normalisation: true,
        normalisation_pregain: PlayerConfig::default().normalisation_pregain,
    };

    let connect_config = ConnectConfig {
        device_type: DeviceType::Speaker,
        linear_volume: false,
        name: name,
        volume: 0x8000,
    };

    let enable_discovery = true;

    Setup {
        backend,
        connect_config,
        credentials: Some(credentials),
        device: Option::None,
        enable_discovery,
        mixer,
        mixer_config,
        player_config,
        player_event_program: Option::None,
        session_config,
        zeroconf_port: 0,
    }
}

struct Main {
    backend: fn(Option<String>) -> Box<dyn Sink>,
    connect: Box<dyn Future<Item = Session, Error = io::Error>>,
    connect_config: ConnectConfig,
    discovery: Option<DiscoveryStream>,
    handle: Handle,
    mixer: fn(Option<MixerConfig>) -> Box<dyn Mixer>,
    mixer_config: MixerConfig,
    player_config: PlayerConfig,
    player_event_channel: Option<UnboundedReceiver<PlayerEvent>>,
    session_config: SessionConfig,
    shutdown: bool,
    signal: IoStream<()>,
    spirc: Option<Spirc>,
    spirc_task: Option<SpircTask>,
}

impl Main {
    fn new(handle: Handle, setup: Setup) -> Main {
        let mut task = Main {
            backend: setup.backend,
            connect_config: setup.connect_config,
            handle: handle.clone(),
            mixer: setup.mixer,
            mixer_config: setup.mixer_config,
            player_config: setup.player_config,
            session_config: setup.session_config,

            connect: Box::new(futures::future::empty()),
            discovery: None,
            player_event_channel: None,
            shutdown: false,
            signal: Box::new(tokio_signal::ctrl_c().flatten_stream()),
            spirc: None,
            spirc_task: None,
        };

        if setup.enable_discovery {
            let config = task.connect_config.clone();
            let device_id = task.session_config.device_id.clone();

            task.discovery =
                Some(discovery(&handle, config, device_id, setup.zeroconf_port).unwrap());
        }

        if let Some(credentials) = setup.credentials {
            task.credentials(credentials);
        }

        task
    }

    fn credentials(&mut self, credentials: Credentials) {
        let config = self.session_config.clone();
        let handle = self.handle.clone();

        let connection = Session::connect(config, credentials, None, handle);

        self.connect = connection;
        self.spirc = None;
        let task = mem::replace(&mut self.spirc_task, None);
        if let Some(task) = task {
            self.handle.spawn(task);
        }
    }
}

impl Future for Main {
    type Item = ();
    type Error = ();

    fn poll(&mut self) -> Poll<(), ()> {
        loop {
            let mut progress = false;

            if let Some(Async::Ready(Some(creds))) =
                self.discovery.as_mut().map(|d| d.poll().unwrap())
            {
                if let Some(ref spirc) = self.spirc {
                    spirc.shutdown();
                }
                self.credentials(creds);

                progress = true;
            }

            if let Async::Ready(session) = self.connect.poll().unwrap() {
                self.connect = Box::new(futures::future::empty());
                let mixer_config = self.mixer_config.clone();
                let mixer = (self.mixer)(Some(mixer_config));
                let player_config = self.player_config.clone();
                let connect_config = self.connect_config.clone();

                let audio_filter = mixer.get_audio_filter();
                let backend = self.backend;
                let (player, event_channel) =
                    Player::new(player_config, session.clone(), audio_filter, move || {
                        (backend)(None)
                    });

                let (spirc, spirc_task) = Spirc::new(connect_config, session, player, mixer);
                self.spirc = Some(spirc);
                self.spirc_task = Some(spirc_task);
                self.player_event_channel = Some(event_channel);

                progress = true;
            }

            if let Async::Ready(Some(())) = self.signal.poll().unwrap() {
                eprintln!("Ctrl-C received");
                if !self.shutdown {
                    if let Some(ref spirc) = self.spirc {
                        spirc.shutdown();
                    } else {
                        return Ok(Async::Ready(()));
                    }
                    self.shutdown = true;
                } else {
                    return Ok(Async::Ready(()));
                }

                progress = true;
            }

            if let Some(ref mut spirc_task) = self.spirc_task {
                if let Async::Ready(()) = spirc_task.poll().unwrap() {
                    if self.shutdown {
                        return Ok(Async::Ready(()));
                    } else {
                        panic!("Spirc shut down unexpectedly");
                    }
                }
            }

            /*if let Some(ref mut player_event_channel) = self.player_event_channel {
                if let Async::Ready(Some(event)) = player_event_channel.poll().unwrap() {
                    println!("{:?}", event);
                }
            }*/

            if !progress {
                return Ok(Async::NotReady);
            }
        }
    }
}

fn run(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let options = cx.argument::<JsValue>(0)?;
    let options: Options = neon_serde::from_value(&mut cx, options)?;

    let config = setup(options);
    let mut core = Core::new().unwrap();
    let handle = core.handle();

    core.run(Main::new(handle, config)).unwrap();

    let ret = cx.boolean(true);
    Ok(ret)
}

register_module!(mut cx, {
    cx.export_function("run", run)?;
    Ok(())
});
