use std::env;

mod format_information;
mod load;
mod utils;
use geo::{Contains, MultiPolygon, Point};
use load::updated_load::{load_lights_geojson, load_municipality};
// use serde_json::json;
use format_information::format_json::format_points_only;
use serde_json::json;
use utils::utility_fns::{get_base_dir, open_file};

const CORRECT_SCRIPT_PARAM_NUM: usize = 3;
const LIGHT_BOUNDING_FILE_INDICATOR: usize = 2;
const BOUNDING_POLYGON_FILE_INDICATOR: usize = 1;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_SCRIPT_PARAM_NUM {
        panic!(
            "usage: cargo run [--release] --bin remove_lights -- path_to_area_file.geojson path_to_lights_file"
        );
    }

    let bounding_polygon_contents =
        match open_file(&(get_base_dir() + "/" + &args[BOUNDING_POLYGON_FILE_INDICATOR])) {
            Ok(contents) => contents,
            Err(err) => panic!("could not open file contents with error: {}", err),
        };

    let bounding_polygon = load_municipality(&bounding_polygon_contents, "MEDFORD");

    let lights_data_file =
        match open_file(&(get_base_dir() + "/" + &args[LIGHT_BOUNDING_FILE_INDICATOR])) {
            Ok(file) => file,
            Err(err) => panic!("could not open file contents with error: {}", err),
        };

    let lights: Vec<Point> = load_lights_geojson(&lights_data_file)
        .iter()
        .filter(|curr_light| !bounding_polygon.contains(*curr_light))
        .collect::<Vec<_>>()
        .iter()
        .map(|curr_point| **curr_point)
        .collect(); 

    let updated_lights_geojson = format_points_only(lights);

    println!("{updated_lights_geojson}");
}

#[allow(dead_code)]
fn format_multipolygon(mp: MultiPolygon) -> String {
    let geojson = json!({
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties" : {},
                "geometry" : {
                    "type": "MultiPolygon",
                    "coordinates": mp.0.iter().map(|polygon| {
                        let exterior = polygon.exterior().points()
                            .map(|p| vec![p.x(), p.y()])
                            .collect::<Vec<_>>();
                        vec![exterior]
                    }).collect::<Vec<_>>()
                }
            }
        ]
    });

    serde_json::to_string_pretty(&geojson).unwrap()
}
