use config::Value;
use serde::Deserialize;
use structopt::StructOpt;

lazy_static::lazy_static! {
    /// This is an example for using doc comment attributes
    pub static ref CONFIG: Config = Config::new().expect("Config could not be loaded.");
}

#[derive(Debug, Deserialize)]
pub struct Config {
    pub chip: Option<String>,
    pub chip_description_path: Option<String>,
    pub probe_index: usize,
    pub core_index: usize,
    pub enable_println: bool,
    pub enable_websockets: bool,
    pub websocket_url: String,
    pub webserver_url: String,
    pub stimuli: Vec<usize>,
}

impl Config {
    pub fn new() -> Result<Self, config::ConfigError> {
        let args: Vec<_> = std::env::args().collect();
        // Get commandline options.
        let opt = Opt::from_iter(&args);

        let mut s = config::Config::new();

        // Start off by merging in the "default" configuration file
        s.merge(config::File::from_str(
            include_str!("default.toml"),
            config::FileFormat::Toml,
        ))?;

        // Add in a local configuration file
        // This file shouldn't be checked in to git
        s.merge(config::File::with_name("config").required(false))?;

        s.set("chip", opt.chip)?;
        s.set("chip_description_path", opt.chip_description_path)?;
        if let Some(pi) = opt.probe_index {
            s.set("probe_index", pi)?;
        }
        if let Some(ci) = opt.core_index {
            s.set("core_index", ci)?;
        }
        if opt.enable_println {
            s.set("enable_println", true)?;
        }
        if opt.enable_websockets {
            s.set("enable_websockets", true)?;
        }
        if let Some(wu) = opt.websocket_url {
            s.set("websocket_url", wu)?;
        }
        if let Some(wu) = opt.webserver_url {
            s.set("webserver_url", wu)?;
        }
        s.set(
            "stimuli",
            opt.stimuli
                .into_iter()
                .map(|s| s.into())
                .collect::<Vec<Value>>(),
        )?;

        // You can deserialize (and thus freeze) the entire configuration as
        s.try_into()
    }
}

#[derive(Debug, StructOpt)]
struct Opt {
    #[structopt(name = "chip", long = "chip")]
    chip: Option<String>,

    #[structopt(
        name = "chip description file path",
        short = "c",
        long = "chip-description-path"
    )]
    chip_description_path: Option<String>,

    /// The number associated with the debug probe to be used.
    #[structopt(long = "probe-index")]
    probe_index: Option<String>,

    /// The core to be used for tracing.
    #[structopt(long = "core-index")]
    core_index: Option<String>,

    #[structopt(long = "println")]
    enable_println: bool,

    #[structopt(long = "websockets")]
    enable_websockets: bool,

    #[structopt(long = "websocket-url")]
    websocket_url: Option<String>,

    #[structopt(long = "webserver-url")]
    webserver_url: Option<String>,

    #[structopt(long = "stimuli")]
    stimuli: Vec<i64>,
}
