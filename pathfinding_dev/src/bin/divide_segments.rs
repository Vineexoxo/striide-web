mod load;
mod utils;
mod format_information;

use load::{types::Walkable, updated_load::get_features};
use utils::utility_fns::{get_base_dir, open_file};
use format_information::format_json::format_walkable_to_geojson;

use geo::{coord, HaversineDistance, LineString, Point};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};

use std::env;

const SIDEWALKS_DATA_INDICATOR: usize = 1;
const CORRECT_SCRIPT_PARAM_NUM: usize = 2;
const LENGTH_THRESHOLD: f64 = 10.0;
const INTERVAL_FACTOR: f64 = 5.0;

fn interpolate_points(start: Point, end: Point, interval: f64) -> Vec<Point> {
    let mut points = Vec::new();
    let total_distance = start.haversine_distance(&end);
    
    if total_distance <= interval {
        points.push(start);
        points.push(end);
        return points;
    }

    let num_intervals = (total_distance / interval).ceil() as usize;
    let delta_lon = (end.x() - start.x()) / num_intervals as f64;
    let delta_lat = (end.y() - start.y()) / num_intervals as f64;

    for i in 0..=num_intervals {
        let new_point = Point::new(start.x() + i as f64 * delta_lon, start.y() + i as f64 * delta_lat);
        points.push(new_point);
    }

    points
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_SCRIPT_PARAM_NUM {
        panic!(
            "usage: cargo run [--release] --bin divide_segments -- path_to_sidewalks_file.geojson"
        );
    }

    let sidewalk_file_path = get_base_dir() + "/" + &args[SIDEWALKS_DATA_INDICATOR];
    let sidewalk_file_contents = match open_file(&sidewalk_file_path) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let sidewalks = get_features(&sidewalk_file_contents);
    assert!(sidewalks.len() > 0);

    let segmented_sidewalks: Vec<Walkable> = sidewalks
        .par_iter()
        .map(|sidewalk| {
            let mut sidewalk_point_collection = vec![];
            for line in sidewalk.segments.lines() {
                let start_point = Point::new(line.start.x, line.start.y);
                let end_point = Point::new(line.end.x, line.end.y);
                let total_distance = start_point.haversine_distance(&end_point);

                if total_distance > LENGTH_THRESHOLD {
                    let points = interpolate_points(start_point, end_point, INTERVAL_FACTOR);
                    sidewalk_point_collection.extend(points);
                } else {
                    sidewalk_point_collection.push(start_point);
                    sidewalk_point_collection.push(end_point);
                }
            }

            let mut updated_sidewalk = sidewalk.clone();
            updated_sidewalk.segments = LineString::from(
                sidewalk_point_collection
                    .iter()
                    .map(|point| coord! {x: point.x(), y: point.y()})
                    .collect::<Vec<_>>(),
            );

            updated_sidewalk
        })
        .collect();

    let json = format_walkable_to_geojson(&segmented_sidewalks);
    println!("{}", json);
}
