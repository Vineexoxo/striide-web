mod format_information;
mod load;
mod utils;

/* use geo::{Contains, Intersects, LineString, Polygon}; */
use geo::{Contains, Intersects, LineString, Polygon};
use load::{types::Walkable, updated_load::get_features, updated_load::load_streets_json};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use serde_json::{json, Map, Value};
use utils::utility_fns::{get_base_dir, open_file};

fn linestring_to_polygon(line_string: LineString<f64>) -> Polygon<f64> {
    let mut coords = line_string.0;

    if coords.first() != coords.last() {
        // eprintln!("closed linestring");
        coords.push(coords[0]);
    }

    Polygon::new(coords.into(), vec![])
}

use std::env;

const CORRECT_SCRIPT_PARAM_NUM: usize = 3;
const BOUNDING_POLYGON_FILE_INDICATOR: usize = 1;
const SIDEWALK_DATASET_FILE_INDICATOR: usize = 2;

fn main() {
    let base_path = get_base_dir();

    let args: Vec<String> = env::args().collect();
    if args.len() != CORRECT_SCRIPT_PARAM_NUM {
        panic!(
            "usage: cargo run [--release] --bin get_bounded_sidewalks -- bounding_poylgon.geojson sidewalks_data_set.geojson"
        );
    }

    let sidewalk_contents =
        match open_file(&(base_path.clone() + "/" + &args[SIDEWALK_DATASET_FILE_INDICATOR])) {
            Ok(contents) => contents,
            Err(err) => panic!("could not open file contents with error: {}", err),
        };

    let polygon_contents =
        match open_file(&(base_path + "/" + &args[BOUNDING_POLYGON_FILE_INDICATOR])) {
            Ok(contents) => contents,
            Err(err) => panic!("could not open file contents with error: {}", err),
        };

    let side_walks: Vec<Walkable> = load_streets_json(&sidewalk_contents);
    let polygon_ls: Vec<Walkable> = get_features(&polygon_contents);
    assert!(polygon_ls.len() == 1);

    let polygon: Polygon = linestring_to_polygon(polygon_ls[0].segments.clone());

    let contained_sidewalks: Vec<Walkable> = side_walks
        .par_iter()
        .filter(|sidewalk| polygon.intersects(&sidewalk.segments))
        .map(|sidewalk| sidewalk.clone())
        .collect(); 

    let mut map: Map<String, Value> = Map::new();
    map.insert("type".into(), Value::String("FeatureCollection".to_owned()));

    let features: Vec<Value> = contained_sidewalks.par_iter().map(|sidewalk| {
        let json = json!({
            "type": "Feature", 
            /* assuming for now that there are no properties */
            "properties": {}, 
            "geometry": {
                "type": "LineString", 
                "coordinates": sidewalk.segments.0.iter().map(|point| [point.x, point.y]).collect::<Vec<_>>()
            }
        }); 
        json
    }).collect(); 

    let geojson = json!({
        "type": "FeatureCollection", 
        "features": features
    });

    println!("{}", serde_json::to_string_pretty(&geojson).unwrap());
}
