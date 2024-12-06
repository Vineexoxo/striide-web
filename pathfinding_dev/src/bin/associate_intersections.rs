/**
 * external mods / crates
 */
use rstar::RTree;
use uuid::Uuid;
mod format_information;
mod load;
use geo::{Intersects, Line, LineString, Point};
use indicatif::{ProgressBar, ProgressStyle};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};

/**
 * internal mods / crates
 */
mod utils;
use format_information::format_json::format_walkable_to_geojson;
use load::{
    types::{IntersectionPoint, Walkable},
    updated_load::get_features,
};
use utils::utility_fns::{get_base_dir, open_file};

use std::env; 

const CORRECT_SCRIPT_PARAM_NUM: usize = 2; 
const SIDEWALKS_DATA_INDICATOR: usize = 1; 
fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_SCRIPT_PARAM_NUM {
        panic!(
            "usage: cargo run [--release] --bin associate_intersections -- path_to_filtered_sidewalks_file.geojson"
        );
    }

    let file_path = get_base_dir() + "/" + &args[SIDEWALKS_DATA_INDICATOR];
    let file_contents = match open_file(&file_path) {
        Ok(contents) => contents,
        Err(err) => panic!("could not open file contents with error: {}", err),
    };

    let mut sidewalks = get_features(&file_contents);
    assign_ids(&mut sidewalks);

    eprintln!("Finished assigning IDs"); 
    get_intersection_points(&mut sidewalks);

    let updated = associate_ids(&sidewalks);
    let json = format_walkable_to_geojson(&updated);
    println!("{json}");
}

fn assign_ids(sidewalks: &mut Vec<Walkable>) {
    let _ = sidewalks
        .iter_mut()
        .map(|sidewalk| {
            sidewalk.id = Some(Uuid::new_v4());
            sidewalk
        })
        .collect::<Vec<_>>();
}

fn get_intersection_points(sidewalks: &mut Vec<Walkable>) {
    let sidewalk_line_strings = sidewalks
        .iter()
        .map(|street: &Walkable| -> LineString { street.segments.clone() })
        .collect();

    let sidewalk_spatial_tree = RTree::bulk_load(sidewalk_line_strings);

    let pb = ProgressBar::new(sidewalks.len() as u64);

    pb.set_style(
        ProgressStyle::with_template(
            "[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}",
        )
        .unwrap()
        .progress_chars("##-"),
    );

    for sidewalk in sidewalks {
        let intersection_points: Vec<IntersectionPoint> =
            get_nearest_intersection_points(sidewalk.segments.clone(), &sidewalk_spatial_tree)
                .iter()
                .map(|point| -> IntersectionPoint {
                    IntersectionPoint {
                        intersection_point: *point,
                        intersecting_street_ids: vec![],
                    }
                })
                .collect();
        
        pb.inc(1); 
        sidewalk.intersection_points = intersection_points;
    }

    pb.finish_with_message("Finished getting all intersection points"); 
}

fn associate_ids(sidewalks: &Vec<Walkable>) -> Vec<Walkable> {

    let pb = ProgressBar::new(sidewalks.len() as u64);

    pb.set_style(
        ProgressStyle::with_template(
            "[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}",
        )
        .unwrap()
        .progress_chars("##-"),
    );

    let updated_sidewalks: Vec<Walkable> = sidewalks.par_iter().map(|sidewalk| {
        let mut intersections: Vec<IntersectionPoint> = vec![];
        for intersection_point in sidewalk.intersection_points.clone() {
            let intersecting_ids = find_inter_ids(
                &intersection_point.intersection_point,
                &sidewalks,
                sidewalk.id.unwrap(),
            );

            let inter_point = IntersectionPoint {
                intersection_point: intersection_point.intersection_point,
                intersecting_street_ids: intersecting_ids,
            };

            intersections.push(inter_point);
        }

        let walkable = Walkable {
            id: sidewalk.id.clone(),
            segments: sidewalk.segments.clone(),
            lights: sidewalk.lights.clone(),
            intersection_points: intersections,
        }; 

        pb.inc(1); 
        walkable
    }).collect(); 

    // for sidewalk in sidewalks {
    //     let mut intersections: Vec<IntersectionPoint> = vec![];
    //     for intersection_point in sidewalk.intersection_points.clone() {
    //         let intersecting_ids = find_inter_ids(
    //             &intersection_point.intersection_point,
    //             &sidewalks,
    //             sidewalk.id.unwrap(),
    //         );

    //         let inter_point = IntersectionPoint {
    //             intersection_point: intersection_point.intersection_point,
    //             intersecting_street_ids: intersecting_ids,
    //         };

    //         intersections.push(inter_point);
    //     }

    //     let walkable = Walkable {
    //         id: sidewalk.id.clone(),
    //         segments: sidewalk.segments.clone(),
    //         lights: sidewalk.lights.clone(),
    //         intersection_points: intersections,
    //     };

    //     updated.push(walkable);
    //     pb.inc(1); 
    // }
    pb.finish_with_message("Finished associating all intersection points"); 
    updated_sidewalks
}

fn get_nearest_intersection_points(sidewalk: LineString, rtree: &RTree<LineString>) -> Vec<Point> {
    let mut seen_hash: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut intersecting_sidewalks: Vec<LineString> = vec![];
    let mut intersections: Vec<Point> = vec![];

    let points: Vec<Point> = sidewalk.points().collect();
    let mut nearest_intersections = rtree.nearest_neighbor_iter_with_distance_2(&points[0]);

    #[allow(while_true)]
    while true {
        let nearest_sidewalk = nearest_intersections.next();
        let (candidate_sidewalk, _) = match nearest_sidewalk {
            Some(sidewalk) => sidewalk,
            None => {
                break;
            }
        };
        intersecting_sidewalks.push(candidate_sidewalk.clone());
    }

    for sidewalk_candidate in intersecting_sidewalks {
        if sidewalk == sidewalk_candidate {
            continue;
        }
        for segment1 in sidewalk.lines() {
            for segment2 in sidewalk_candidate.lines() {
                if segment1.intersects(&segment2) {
                    if let Some(intersection) = line_intersection(&segment1, &segment2) {
                        let hashable_repr =
                            &(intersection.x().to_string() + "," + &intersection.y().to_string());
                        if !seen_hash.contains(hashable_repr) {
                            intersections.push(intersection);
                            seen_hash.insert(hashable_repr.to_owned());
                        }
                    }
                }
            }
        }
    }

    intersections
}

/* code that calculates the line intersection point between lines */
fn line_intersection(line1: &Line<f64>, line2: &Line<f64>) -> Option<Point<f64>> {
    const PARALLEL_LINE_INDICATOR: f64 = 0.0;

    let denom = (line1.end.x - line1.start.x) * (line2.end.y - line2.start.y)
        - (line1.end.y - line1.start.y) * (line2.end.x - line2.start.x);

    if denom == PARALLEL_LINE_INDICATOR {
        return None;
    }

    let ua = ((line2.end.x - line2.start.x) * (line1.start.y - line2.start.y)
        - (line2.end.y - line2.start.y) * (line1.start.x - line2.start.x))
        / denom;

    let x = line1.start.x + ua * (line1.end.x - line1.start.x);
    let y = line1.start.y + ua * (line1.end.y - line1.start.y);

    Some(Point::new(x, y))
}

fn is_points_equal(point1: &geo::Point, point2: &geo::Point) -> bool {
    point1.x().to_bits() == point2.x().to_bits() && point1.y().to_bits() == point2.y().to_bits()
}

fn find_inter_ids(
    inter_point: &geo::Point,
    sidewalks: &Vec<Walkable>,
    intersection_point_id: Uuid,
) -> Vec<Uuid> {
    let mut ids = vec![];
    for sidewalk in sidewalks {
        let points = sidewalk.segments.points();
        let id = sidewalk.id.unwrap();

        for point in points {
            if is_points_equal(&point, inter_point) && id != intersection_point_id {
                ids.push(id);
            }
        }
    }

    ids
}
