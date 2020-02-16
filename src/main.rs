mod updater;
mod config;

use std::path::Path;

use colored::*;
use failure::format_err;
use scroll::Pread;

use probe_rs::config::TargetSelector;
use probe_rs::Probe;
use probe_rs::itm::{TracePacket, Decoder};

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
    let mut core = session.attach_to_core(CONFIG.core_index)?;

    session.trace_enable(&mut core).unwrap();
    session.setup_tracing(&mut core).unwrap();

    let mut timestamp: f64 = 0.0;

    let mut decoder = Decoder::new();

    let mut stimuli = vec![String::new(); 32];

    println!("Starting ITM trace ...");

    loop {
        let bytes = session.read_swv().unwrap();

        decoder.feed(bytes);
        while let Some(packet) = decoder.pull() {
            match packet {
                TracePacket::TimeStamp { tc, ts } => {
                    log::debug!("Timestamp packet: tc={} ts={}", tc, ts);
                    let mut time_delta: f64 = ts as f64;
                    // Divide by core clock frequency to go from ticks to seconds.
                    time_delta /= 16_000_000.0;
                    timestamp += time_delta;
                }
                TracePacket::DwtData { id, payload } => {
                    log::warn!("Dwt: id={} payload={:?}", id, payload);

                    if id == 17 {
                        let value: i32 = payload.pread(0).unwrap();
                        log::trace!("VAL={}", value);
                        // client.send_sample("a", timestamp, value as f64).unwrap();
                    }
                }
                TracePacket::ItmData { id, payload } => {
                    // First decode the string data from the stimuli.
                    stimuli[id].push_str(&String::from_utf8_lossy(&payload));
                    // Then collect all the lines we have gotten so far.
                    let data = stimuli[id].clone();
                    let mut lines: Vec<_> = data.lines().collect();
                    
                    // If there is at least one char in the total of all received chars, look at the last one.
                    let last_char = stimuli[id].chars().last();
                    if let Some(last_char) = last_char {
                        // If the last one is not a newline (this is always the last one for Windows (\r\n) as well as Linux (\n)),
                        // we keep the last line as it was not fully received yet.
                        if last_char != '\n' {
                            // Get the last line and keep it if there is even one.
                            if let Some(last_line) = lines.pop() {
                                stimuli[id] = last_line.to_string();
                            }
                        } else {
                            stimuli[id] = String::new();
                        }
                    }

                    // Finally print all due lines!
                    for line in lines {
                        println!("{}> {}", id, line);
                    }
                }
                _ => {
                    log::warn!("Trace packet: {:?}", packet);
                }
            }
            log::debug!("{}", timestamp);
        }
    }
}