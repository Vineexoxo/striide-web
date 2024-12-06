mod load;
/**
 * internal mods / crates
 */
mod utils;
mod format_information;
use load::{types::Walkable, updated_load::get_features};
use utils::utility_fns::{get_base_dir, open_file};
use format_information::format_json::format_points_only; 
/**
 * external mods / crates
 */
use geo::Point;

fn main() {
    let file_path = get_base_dir() + "/sanity.json";
    let file_contents = match open_file(&file_path) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let sidewalks: Vec<Walkable> = get_features(&file_contents);

    /* this was terrible to write */
    let intersection_points: Vec<Point> = sidewalks
        .iter()
        .map(|sidewalk| -> Vec<Point> {
            sidewalk
                .intersection_points
                .iter()
                .fold(vec![], |mut acc, inter_point| {
                    acc.push(inter_point.intersection_point);
                    acc
                })
                .into_iter()
                .collect()
        })
        .collect::<Vec<_>>()
        .into_iter()
        .flatten()
        .collect();

    println!("{}", format_points_only(intersection_points)); 
}
