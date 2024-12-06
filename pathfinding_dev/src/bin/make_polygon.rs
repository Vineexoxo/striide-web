mod load;
mod utils;
use geo::{algorithm::convex_hull::qhull::quick_hull, coord, Coord};
use load::updated_load::load_lights_geojson;
use serde_json::{Map, Value};
use utils::utility_fns::{get_base_dir, open_file};

use std::env;

const CORRECT_SCRIPT_PARAM_NUM: usize = 2;
const POINTS_FILE_INDICATOR: usize = 1;

fn main() {
    let base_path = get_base_dir();

    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_SCRIPT_PARAM_NUM {
        panic!(
            "usage: cargo run [--release] --bin make_polygon -- path_to_polygon_points_file.json"
        );
    }

    let filepath = base_path  + "/" + &args[POINTS_FILE_INDICATOR];

    let file_contents = match open_file(&filepath) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let mut lights: Vec<Coord> = load_lights_geojson(&file_contents)
        .iter()
        .map(|point| -> Coord {
            coord! {x: point.x(), y: point.y()}
        })
        .collect();

    let polygon = quick_hull(&mut lights);
    let mut map: Map<String, Value> = Map::new();

    map.insert("type".into(), Value::String("FeatureCollection".to_owned()));

    let mut polygon_map: Map<String, Value> = Map::new();
    polygon_map.insert("type".into(), serde_json::Value::String("Feature".into()));

    let mut street_geometry_map: Map<String, Value> = Map::new();

    street_geometry_map.insert(
        "type".into(),
        serde_json::Value::String("LineString".into()),
    );

    let mut street_coords: Vec<Value> = vec![];

    for coord in polygon.coords() {
        street_coords.push(serde_json::Value::Array(vec![
            serde_json::Value::Number(serde_json::value::Number::from_f64(coord.x).unwrap()),
            serde_json::Value::Number(serde_json::value::Number::from_f64(coord.y).unwrap()),
        ]));
    }

    street_geometry_map.insert("coordinates".into(), Value::Array(street_coords));

    polygon_map.insert("geometry".into(), Value::Object(street_geometry_map));

    let properties_map: Map<String, serde_json::Value> = Map::new();

    polygon_map.insert(
        "properties".into(),
        serde_json::Value::Object(properties_map),
    );

    map.insert("type".into(), Value::String("FeatureCollection".to_owned()));

    let features = vec![Value::Object(polygon_map)];

    map.insert("features".into(), serde_json::Value::Array(features));

    let json = serde_json::to_string_pretty(&map).unwrap();

    println!("{json}");
}
