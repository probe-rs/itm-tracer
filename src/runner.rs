use scroll::Pread;
use serde::{Deserialize, Serialize};

use probe_rs::architecture::arm::swo::{Decoder, TracePacket};
use probe_rs::Session;

use crate::config::CONFIG;
use crate::updater::{Updater, UpdaterChannel, WebsocketUpdater};

#[derive(Debug, Serialize)]
enum Update {
    Packet(TracePacket),
}

#[derive(Debug, Deserialize)]
enum Command {
    Nop,
}

pub fn runner(session: &mut Session) -> ! {
    let mut decoder = Decoder::new();

    let mut console = if CONFIG.enable_println {
        Some(vec![String::new(); 32])
    } else {
        None
    };

    let mut websockets: Option<UpdaterChannel<Command, Update>> = if CONFIG.enable_websockets {
        Some(WebsocketUpdater::new(&CONFIG.websocket_url).start())
    } else {
        None
    };

    let mut timestamp: f64 = 0.0;

    loop {
        if let Some(updater) = websockets.as_mut() {
            match updater.rx().try_recv() {
                Ok(command) => {
                    log::info!("Got backend command message: {:?}", command);

                    match command {
                        _ => (),
                    };
                }
                _ => (),
            }
        }

        let bytes = session.read_swo().unwrap();

        decoder.feed(bytes);
        while let Some(packet) = decoder.pull() {
            if let Some(updater) = websockets.as_mut() {
                let _ = updater.tx().send(Update::Packet(packet.clone()));
            }

            match packet {
                TracePacket::TimeStamp { tc, ts } => {
                    log::debug!("Timestamp packet: tc={} ts={}", tc, ts);
                    let mut time_delta: f64 = ts as f64;
                    // Divide by core clock frequency to go from ticks to seconds.
                    time_delta /= 16_000_000.0;
                    timestamp += time_delta;
                }
                TracePacket::ItmData { id, payload } => {
                    if let Some(stimuli) = console.as_mut() {
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
                }
                _ => {
                    log::warn!("Trace packet: {:?}", packet);
                }
            }
            log::debug!("{}", timestamp);
        }
    }
}
