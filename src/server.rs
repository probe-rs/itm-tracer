use std::net::SocketAddr;

use warp::Filter;

use crate::config::CONFIG;

pub fn start() {
    tokio::spawn(async move {
        println!("Spawning webserver on {}", CONFIG.webserver_url);
        let index = warp::get()
            .and(warp::path::end())
            .and(warp::fs::file("./frontend/dist/index.html"));
        let public = warp::get()
            .and(warp::path("static"))
            .and(warp::fs::dir("frontend/dist"));

        let address: SocketAddr = CONFIG
            .webserver_url
            .parse()
            .expect("The given webserver URL is invalid. Please specify one in the format ip:port");
        warp::serve(index.or(public)).run(address).await;
    });
}
