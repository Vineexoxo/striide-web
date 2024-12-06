#![allow(unused_imports)]
use std::sync::mpsc;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use std::time::Instant;

/*
 *  internal mods / crates
 */

mod compute;
mod format_information;
mod load;
mod utils;
use compute::calculate_nearest::get_k_nearest_neighbors;
use format_information::format_json::format_walkable_to_geojson;
use load::updated_load::get_features;
use load::updated_load::load_lights_geojson;
use load::{types::Walkable, updated_load::load_lights};
use utils::utility_fns::{get_base_dir, open_file};

/*
*  external crates
*/
use geo::Point;
use indicatif::ProgressBar;
use indicatif::ProgressStyle;
use num_cpus;
use rstar::RTree;

fn main() {
    let base_path = get_base_dir();
    let sidewalk_filepath = base_path.clone() + "/testing_json_files/sanity.geojson";

    let sidewalk_file_contents = match open_file(&sidewalk_filepath) {
        Ok(contents) => contents,
        Err(err) => panic!("Could not get file contents with error: {}", err),
    };

    let sidewalks: Vec<Walkable> = get_features(&sidewalk_file_contents);

    let lights_path = base_path + "/swapped_lights.json";
    let lights_file_contents = match open_file(&lights_path) {
        Ok(contents) => contents,
        Err(err) => panic!("Could not get file contents with error: {}", err),
    };
    let lights = load_lights_geojson(&lights_file_contents);

    let light_distance_tree: Arc<RTree<Point>> = Arc::new(RTree::bulk_load(lights));

    let sidewalks: Arc<Vec<Walkable>> = Arc::new(sidewalks);
    let num_sidewalks = sidewalks.len();
    assert!(num_sidewalks > 0);

    let (rx, tx) = mpsc::channel();

    let chunk_length = num_sidewalks / num_cpus::get();
    let mut handles = vec![];

    let mut outer_bound = 0;
    while outer_bound < num_sidewalks {
        let curr_sidewalks = Arc::clone(&sidewalks);
        let dist_tree = Arc::clone(&light_distance_tree);
        let rx = rx.clone();

        let start = outer_bound;
        let end = if outer_bound + chunk_length < num_sidewalks {
            outer_bound + chunk_length
        } else {
            num_sidewalks
        };

        let handle = thread::spawn(move || {
            let curr_slice = &curr_sidewalks[start..end];

            for sidewalk in curr_slice {
                let nearest_lights: Vec<Vec<Point>> =
                    get_k_nearest_neighbors(5, &sidewalk.segments, &dist_tree);

                let light_points: Vec<Point> = nearest_lights.into_iter().flatten().collect();

                rx.send(Walkable {
                    id: sidewalk.id,
                    segments: sidewalk.segments.clone(),
                    lights: light_points,
                    intersection_points: sidewalk.intersection_points.clone(),
                })
                .unwrap();
            }
        });
        handles.push(handle);
        outer_bound += chunk_length + 1;
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let mut results = vec![];
    while let Ok(street) = tx.try_recv() {
        results.push(street);
    }

    let json = format_walkable_to_geojson(&results);
    println!("{json}");
}
