mod updater;
mod config;
mod runner;

use std::path::Path;

use colored::*;
use failure::format_err;

use probe_rs::config::TargetSelector;
use probe_rs::Probe;

use crate::config::CONFIG;

fn main() {
    pretty_env_logger::init();
    match main_try() {
        Ok(_) => (),
        Err(e) => {
            eprintln!("{}: {}", "error".red().bold(), e);
            std::process::exit(1);
        }
    }
}

fn main_try() -> Result<(), failure::Error> {
    // Make sure we load the config given in the cli parameters.
    if let Some(cdp) = CONFIG.chip_description_path.as_ref() {
        probe_rs::config::registry::add_target_from_yaml(&Path::new(cdp))?;
    }

    let chip = CONFIG.chip
        .as_ref()
        .map(|chip| chip.into())
        .unwrap_or(TargetSelector::Auto);

    // Get a list of all available debug probes.
    let probes = Probe::list_all();

    let device = probes.get(CONFIG.probe_index).ok_or_else(|| {
        format_err!("Unable to open probe with index {}: Probe not found.", CONFIG.probe_index)
    })?;

    // Use the first probe found.
    let probe = Probe::from_probe_info(&device)?;

    // Attach to a chip.
    let mut session = probe.attach(chip)?;

    {
        let mut core = session.attach_to_core(CONFIG.core_index)?;

        session.trace_enable(&mut core)?;
        session.setup_tracing(&mut core)?;
        session.start_trace_memory_address(&mut core, 0, 0x2000_3000)?;
        session.start_trace_memory_address(&mut core, 1, 0x2000_3040)?;
    }

    println!("Starting ITM trace ...");

   runner::runner(&mut session);
}