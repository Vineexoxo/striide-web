mod load;
mod utils;
mod format_information;
use indicatif::{ProgressBar, ProgressStyle};
use load::updated_load::{get_features, load_building_coordinates};
use utils::utility_fns::{get_base_dir, open_file};
use format_information::format_json::format_points_only; 

use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use geo::{coord, point, Contains, Coord, LineString, Point, Polygon};
use std::env;

fn linestring_to_polygon(line_string: LineString<f64>) -> Polygon<f64> {
    let mut coords = line_string.0;

    if coords.first() != coords.last() {
        coords.push(coords[0]);
    }

    Polygon::new(coords.into(), vec![])
}

const CORRECT_PARAM_NUM: usize = 3;
const BUILDINGS_INDICATOR: usize = 2;
const BOUNDING_POLYGON_INDICATOR: usize = 1;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_PARAM_NUM {
        panic!("usage: cargo run [--release] --bin get_bounded_buildings -- path_to_bounding_polygon path_to_buildings_dataset");
    }

    let bounding_polygon_path = get_base_dir() + "/" + &args[BOUNDING_POLYGON_INDICATOR];
    let bounding_polygon_contents = match open_file(&bounding_polygon_path) {
        Ok(file) => file,
        Err(e) => panic!("Error opening bounding polygon file with error: {}", e),
    };

    let bounding_polygon =
        linestring_to_polygon(get_features(&bounding_polygon_contents)[0].segments.clone());

    let buildings_path = get_base_dir() + "/" + &args[BUILDINGS_INDICATOR];
    let buildings_contents = match open_file(&buildings_path) {
        Ok(file) => file,
        Err(e) => panic!("Error opening bounding polygon file with error: {}", e),
    };

    let buildings: Vec<Coord> = load_building_coordinates(&buildings_contents)
        .iter()
        .map(|point| {
            coord! {x: point.x(), y: point.y()}
        })
        .collect();

    let pb = ProgressBar::new(buildings.len() as u64);

    pb.set_style(
        ProgressStyle::with_template(
            "[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}",
        )
        .unwrap()
        .progress_chars("##-"),
    );
    
    let filtered_buildings: Vec<Point> = buildings
        .par_iter()
        .filter(|coord| bounding_polygon.contains(&(*coord).clone()))
        .map(|coord| {
            pb.inc(1); 
            point! {x: coord.x, y: coord.y }
        })
        .collect();
    
    pb.finish_with_message("Finished processing all buildings"); 
    
    let json = format_points_only(filtered_buildings); 

    println!("{json}"); 
}
