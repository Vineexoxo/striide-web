/**
 * this script was created to swap the coordinates of the lights file 
 * This script is not intended to be used in the data generation procedure. 
 */

/*
 *  internal mods / crates
 */

mod compute;
mod format_information;
mod load;
mod utils;
use load::updated_load::load_lights;
use utils::utility_fns::{get_base_dir, open_file};

/*
 *  external mods / crates
 */
use serde_json::{json, Value};
fn main() {
    let file_path = get_base_dir() + "/official_nav_json_files/converted_light_data.json";
    let file_contents = match open_file(&file_path) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let lights = load_lights(&file_contents);

    let features: Vec<Value> = lights
        .iter()
        .map(|point| {
            json!({
                "type": "Feature",
                "geometry": {
                    "coordinates": [point.x, point.y],
                    "type": "Point",
                },
                "properties": {}
            })
        })
        .collect();

    let json = json!({
        "type": "FeatureCollection",
        "features": features
    });

    println!("{}", serde_json::to_string_pretty(&json).unwrap()); 
}
