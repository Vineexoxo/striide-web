/*
 *  internal mods / crates
 */

mod compute;
mod format_information;
mod load;
mod utils;
use compute::calculate_nearest::get_k_nearest_neighbors;
use format_information::format_json::format_walkable_to_geojson;
use load::{
    types::Walkable,
    updated_load::{get_features, load_lights_geojson},
};
use utils::utility_fns::{get_base_dir, open_file};

/*
 *  external mods / crates
 */
use geo::Point;
use indicatif::{ProgressBar, ProgressStyle};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use rstar::RTree;

use std::env;
const LIGHTS_DATA_INDICATOR: usize = 1;
const SIDEWALKS_DATA_INDICATOR: usize = 2;
const CORRECT_SCRIPT_PARAM_NUM: usize = 3;
fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != CORRECT_SCRIPT_PARAM_NUM {
        panic!(
            "usage: cargo run [--release] --bin associate_lights -- path_to_lights_file.geojson path_to_filtered_sidewalks_file.geojson"
        );
    }

    let lights_file_path = get_base_dir() + "/" + &args[LIGHTS_DATA_INDICATOR];
    let lights_file_contents = match open_file(&lights_file_path) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let sidewalk_file_path = get_base_dir() + "/" + &args[SIDEWALKS_DATA_INDICATOR];
    let sidewalk_file_contents = match open_file(&sidewalk_file_path) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let lights = load_lights_geojson(&lights_file_contents);
    let sidewalks = get_features(&sidewalk_file_contents);
    let dist_tree = RTree::bulk_load(lights);

    let pb = ProgressBar::new(sidewalks.len() as u64);

    pb.set_style(
        ProgressStyle::with_template(
            "[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}",
        )
        .unwrap()
        .progress_chars("##-"),
    );

    let updated = sidewalks
        .par_iter()
        .map(|sidewalk| -> Walkable {
            let nearest_lights: Vec<Vec<Point>> =
                get_k_nearest_neighbors(5, &sidewalk.segments, &dist_tree);
            let light_points: Vec<Point> = nearest_lights.into_iter().flatten().collect();

            pb.inc(1);
            Walkable {
                id: sidewalk.id,
                segments: sidewalk.segments.clone(),
                lights: light_points,
                intersection_points: sidewalk.intersection_points.clone(),
            }
        })
        .collect::<Vec<_>>();

    pb.finish_with_message("Finished processing all the lights");

    println!("{}", format_walkable_to_geojson(&updated));
}
