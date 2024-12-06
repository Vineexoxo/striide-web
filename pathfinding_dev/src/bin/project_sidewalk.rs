mod format_information;
mod load;
mod utils;

use format_information::format_json::format_walkable_feature;
use indicatif::{ProgressBar, ProgressStyle};
use load::{
    types::Walkable,
    updated_load::get_features,
};
use serde_json::json;
use utils::utility_fns::{get_base_dir, open_file};

use rayon::iter::{IntoParallelRefIterator, ParallelIterator};

use geo::{Contains, Coord, LineString, Point, Polygon};
use rstar::RTree;
use std::env;

const SIDEWALKS_DATA_SET: usize = 2;
const BOUNDING_POLYGON: usize = 1;
const CORRECT_NUM_PARAMS: usize = 4;
const RESIDENTIAL_DATA_SET: usize = 3;

#[allow(dead_code)]
struct SideWalk {
    left: Walkable,
    right: Walkable,
}

fn linestring_to_polygon(line_string: LineString<f64>) -> Polygon<f64> {
    let mut coords = line_string.0;

    if coords.first() != coords.last() {
        coords.push(coords[0]);
    }

    Polygon::new(coords.into(), vec![])
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_NUM_PARAMS {
        panic!("usage: cargo run [--release] --bin project_sidewalk -- bounding_polygon path_to_sidewalk_data_set residential_streets_data_set");
    }

    let sidewalks_file_path = get_base_dir() + "/" + &args[SIDEWALKS_DATA_SET];
    let sidewalks_file_contents = match open_file(&sidewalks_file_path) {
        Ok(file) => file,
        Err(err) => panic!("Could not open file with error: {}", err),
    };

    let bounding_polygon_path = get_base_dir() + "/" + &args[BOUNDING_POLYGON];
    let bounding_polygon = match open_file(&bounding_polygon_path) {
        Ok(file) => file,
        Err(err) => panic!("Could not open file with error: {}", err),
    };

    let residential_file_path = get_base_dir() + "/" + &args[RESIDENTIAL_DATA_SET];
    let residential_streets_contents = match open_file(&residential_file_path) {
        Ok(file) => file,
        Err(err) => panic!("Could not open file with error: {}", err),
    };

    let residential_streets = get_features(&residential_streets_contents);

    let polygon_points = get_features(&bounding_polygon); 
    assert!(polygon_points.len() == 1); 

    let polygon = linestring_to_polygon(polygon_points[0].segments.clone());

    let streets = get_features(&sidewalks_file_contents)
        .iter()
        .map(|sidewalk| sidewalk.segments.clone())
        .collect();

    let filtered_residential_streets: Vec<LineString> = residential_streets
        .iter()
        .filter(|sidewalk| polygon.contains(&sidewalk.segments.to_owned()))
        .map(|sidewalk| sidewalk.segments.clone())
        .collect();

    let street_spatial_tree = RTree::bulk_load(streets);

    const DIST_THRESHOLD: f64 = 0.00000003;

    let filtered_copy = filtered_residential_streets.clone();

    eprintln!("finished loading all data"); 
    let pb = ProgressBar::new(filtered_copy.len() as u64);

    pb.set_style(
        ProgressStyle::with_template(
            "[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}",
        )
        .unwrap()
        .progress_chars("##-"),
    );

    let only_sidewalkless_streets: Vec<&LineString> = filtered_copy
        .par_iter()
        .filter(|sidewalk| {
            let points: Vec<Point> = sidewalk.points().collect();

            for point in points {
                let mut distances =
                    street_spatial_tree.nearest_neighbor_iter_with_distance_2(&point);

                /* have to skip itself */
                distances.next().unwrap().1;

                let distance = distances.next().unwrap().1;
                // eprintln!("{distance}");

                if distance > DIST_THRESHOLD {
                    return true;
                }
            }

            pb.inc(1); 
            false
        })
        .collect();
    assert!(only_sidewalkless_streets.len() > 0);

    pb.finish_with_message("finished filtering through sidewalkless residential streets"); 

    let pb = ProgressBar::new(only_sidewalkless_streets.len() as u64);

    pb.set_style(
        ProgressStyle::with_template(
            "[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}",
        )
        .unwrap()
        .progress_chars("##-"),
    );


    let sidewalks: Vec<SideWalk> = only_sidewalkless_streets
        .par_iter()
        .map(|sidewalk| {
            let (left_sidewalk, right_sidewalk) = compute_projection(sidewalk, 0.00003);

            pb.inc(1); 

            SideWalk {
                left: Walkable {
                    lights: vec![],
                    id: None,
                    segments: left_sidewalk,
                    intersection_points: vec![],
                },
                right: Walkable {
                    lights: vec![],
                    id: None,
                    segments: right_sidewalk,
                    intersection_points: vec![],
                },
            }
        })
        .collect();

    pb.finish_with_message("finished creating projections"); 

    let mut formatted = vec![];
    for sidewalk in sidewalks {
        let left_feature = format_walkable_feature(&sidewalk.left);
        let right_feature = format_walkable_feature(&sidewalk.right);

        formatted.extend(vec![left_feature, right_feature]);
    }

    // let json = format_walkable_to_geojson(&filtered_streets);
    let json = json!({
        "type": "FeatureCollection",
        "features": formatted
    });

    println!("{json}");
}

fn compute_projection(sidewalk: &LineString, offset: f64) -> (LineString<f64>, LineString<f64>) {
    let points: Vec<Point> = sidewalk.points().collect();

    let mut left_coords = vec![];
    let mut right_coords = vec![];

    for i in 0..points.len() - 1 {
        let start: Coord<f64> = points[i].into();
        let end: Coord<f64> = points[i + 1].into();

        // Direction vector of the segment
        let dx = end.x - start.x;
        let dy = end.y - start.y;

        // Length of the segment
        let length = (dx * dx + dy * dy).sqrt();

        // Normalize the perpendicular vectors
        let perp_x = dy / length;
        let perp_y = -dx / length;

        // Offset the start and end points to the right side
        let new_right_start = Coord {
            x: start.x + offset * perp_x,
            y: start.y + offset * perp_y,
        };
        let new_right_end = Coord {
            x: end.x + offset * perp_x,
            y: end.y + offset * perp_y,
        };

        // Offset the start and end points to the left side
        let new_left_start = Coord {
            x: start.x - offset * perp_x,
            y: start.y - offset * perp_y,
        };
        let new_left_end = Coord {
            x: end.x - offset * perp_x,
            y: end.y - offset * perp_y,
        };

        left_coords.push(new_left_start);
        right_coords.push(new_right_start);

        if i == points.len() - 2 {
            left_coords.push(new_left_end);
            right_coords.push(new_right_end);
        }
    }

    (
        LineString::from(left_coords),
        LineString::from(right_coords),
    )
}
