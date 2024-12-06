mod compute;
mod format_information;
mod load;
mod utils;

use compute::calculate_nearest::get_k_nearest_neighbors;
use load::updated_load::{get_features, load_lights_geojson};
use serde_json::{json, Map, Value};
use utils::utility_fns::{get_base_dir, open_file};
use load::types::IntersectionPoint; 

use geo::{Point, LineString};
use indicatif::{ProgressBar, ProgressStyle};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use rstar::RTree;
use uuid::Uuid;
use std::env;

const CORRECT_SCRIPT_PARAM_NUM: usize = 3;
const SIDEWALK_DATA_SET: usize = 2;
const BUILDINGS_DATA_SET: usize = 1;

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct WalkableWithBuilding {
    pub id: Option<Uuid>,
    pub segments: LineString,
    pub lights: Vec<Point>,
    pub intersection_points: Vec<IntersectionPoint>,
    pub buildings: Vec<Point>
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_SCRIPT_PARAM_NUM {
        panic!(
            "usage: cargo run [--release] --bin associate_buildings -- path_to_buildings.geojson path_to_filtered_sidewalks_file.geojson"
        );
    }

    let building_file_path = get_base_dir() + "/" + &args[BUILDINGS_DATA_SET];
    let building_file_contents = match open_file(&building_file_path) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let sidewalk_file_path = get_base_dir() + "/" + &args[SIDEWALK_DATA_SET];
    let sidewalk_file_contents = match open_file(&sidewalk_file_path) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let sidewalks = get_features(&sidewalk_file_contents);
    let buildings = load_lights_geojson(&building_file_contents);
    let spatial_tree = RTree::bulk_load(buildings);

    let pb = ProgressBar::new(sidewalks.len() as u64);

    pb.set_style(
        ProgressStyle::with_template(
            "[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}",
        )
        .unwrap()
        .progress_chars("##-"),
    );

    let updated: Vec<WalkableWithBuilding> = sidewalks
        .par_iter()
        .map(|sidewalk| {
            let nearest_buildings = get_k_nearest_neighbors(5, &sidewalk.segments, &spatial_tree);
            pb.inc(1); 

            let associated_buildings: Vec<Point> = nearest_buildings.into_iter().flatten().collect();

            WalkableWithBuilding {
                id: sidewalk.id,
                segments: sidewalk.segments.clone(),
                lights: sidewalk.lights.clone(),
                intersection_points: sidewalk.intersection_points.clone(),
                buildings: associated_buildings
            }
        })
        .collect();

    pb.finish_with_message("Finished associating all buildings");

    let json = format_walkable_to_geojson(&updated); 
    
    println!("{json}"); 
}

pub fn format_walkable_to_geojson(walkables: &Vec<WalkableWithBuilding>) -> String {
    let mut map: Map<String, Value> = Map::new();
    let mut feature_collection = vec![];

    map.insert("type".into(), Value::String("FeatureCollection".to_owned()));
    map.insert("type".into(), Value::String("FeatureCollection".to_owned()));

    for walkable in walkables {
        feature_collection.push(format_walkable_feature(&walkable));
    }

    map.insert(
        "features".into(),
        serde_json::Value::Array(feature_collection),
    );

    serde_json::to_string_pretty(&map).unwrap()
}

pub fn format_walkable_feature(walkable: &WalkableWithBuilding) -> Value {
    let intersection_points: Vec<Value> = walkable
        .intersection_points
        .iter()
        .map(|inter_point| -> Value {
            json!({    
                "point_coordinates": [inter_point.intersection_point.x(), inter_point.intersection_point.y()], 
                "intersecting_street_ids": inter_point.intersecting_street_ids.iter().map(|id| -> String {id.to_string()}).collect::<Vec<_>>()
            })
        })
        .collect();

    json!({
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": walkable.segments.0.iter().map(|point| [point.x, point.y]).collect::<Vec<_>>()
        },
        "properties": {
            "intersection points": intersection_points,
            "lights": walkable.lights.iter().map(|point| [point.x(), point.y()]).collect::<Vec<_>>(),
            "id": walkable.id.as_ref().map_or("NONE".to_string(), |id| id.to_string()), 
            "buildings": walkable.buildings.iter().map(|point| [point.x(), point.y()]).collect::<Vec<_>>()
            /* uncomment the bottom lines for color options for debugging */
            // "stroke": random_hex_color(),
            // "stroke-width": 2
        }
    })
}