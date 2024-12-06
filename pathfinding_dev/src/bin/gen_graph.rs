/*
 *  internal modules
 */

mod format_information;
mod load;
mod utils;

use std::collections::HashMap;
use std::io::Write;

/*
 *  internal crates
 */
use load::types::{F64Wrapper, HashablePoint, Walkable};
use load::updated_load::get_features;
// use serde_json::{json, Value};
// use serde_json::json;
use utils::utility_fns::{get_base_dir, open_file};

/*
 *  external crates
 */
use petgraph::{
    graph::{NodeIndex, UnGraph},
    Undirected,
};
use rstar::RTree;
// use serde_json::{json, Value};
use rocket::serde::{Deserialize, Serialize};
use uuid::Uuid;
use flate2::write::GzEncoder;
use flate2::Compression;

/**
 *  !! edges that are between nodes that belong to the same street have an edge weight of 1.0
 */
const INTERNAL_SIDEWALK_EDGE_WEIGHT: f64 = 1.0;

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct GraphSerialize {
    nodes: Vec<geo::Point>,
    edges: Vec<(geo::Point, geo::Point, f64)>,
}

use std::env;

const CORRECT_SCRIPT_PARAM_NUM: usize = 2;
const DATA_FILE_INDICATOR: usize = 1;
fn main() {
    let base_path = get_base_dir();

    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_SCRIPT_PARAM_NUM {
        panic!("usage: cargo run [--release] --bin gen_graph -- path_to_geojson_file.geojson");
    }

    let filepath = base_path + "/" + &args[DATA_FILE_INDICATOR];

    let file_contents = match open_file(&filepath) {
        Ok(contents) => contents,
        Err(err) => panic!("Could not get file contents with error: {}", err),
    };

    let sidewalks = get_features(&file_contents);
    assert!(sidewalks.len() > 0);

    let walkable_map = create_walkable_map(&sidewalks);

    // let segment_points_tree = load_segment_points(&sidewalks);

    let mut point_to_index_map: std::collections::HashMap<HashablePoint, NodeIndex> =
        std::collections::HashMap::new();

    let mut index_to_point_map: std::collections::HashMap<NodeIndex, geo::Point> =
        std::collections::HashMap::new();

    let mut graph: petgraph::Graph<geo::Point, f64, Undirected> = UnGraph::new_undirected();

    create_paths(
        &mut graph,
        &sidewalks,
        &mut point_to_index_map,
        &mut index_to_point_map,
    );

    connect_intersections(
        &mut graph,
        &sidewalks,
        &mut point_to_index_map,
        &walkable_map,
    );

    let nodes = graph
        .node_indices()
        .map(|n| geo::Point::new(graph[n].x(), graph[n].y()))
        .collect::<Vec<_>>();
    let edges: Vec<(geo::Point, geo::Point, f64)> = graph
        .edge_indices()
        .map(|e| {
            let (source, target) = graph.edge_endpoints(e).unwrap();
            let weight = *graph.edge_weight(e).unwrap();
            (
                geo::Point::new(graph[source].x(), graph[source].y()),
                geo::Point::new(graph[target].x(), graph[target].y()),
                weight,
            )
        })
        .collect();

    let serializeable_graph = GraphSerialize {
        nodes: nodes,
        edges: edges,
    };

    let json = serde_json::to_string_pretty(&serializeable_graph).unwrap();

    // let minified_json = json.replace(" ", "").replace("\n", "");

    // println!("{minified_json}");

    let compressed_file = std::fs::File::create("output.json.gz").unwrap();
    let mut encoder = GzEncoder::new(compressed_file, Compression::default());

    // Write the compressed data
    encoder.write_all(json.as_bytes()).unwrap();
    encoder.finish().unwrap();

    // let starting_point = point_to_index_map.get(&HashablePoint {
    //     x: F64Wrapper(-71.0521206843562),
    //     y: F64Wrapper(42.36368463654058),
    // });

    // let ending_point = point_to_index_map.get(&HashablePoint {
    //     x: F64Wrapper(-71.05638522273712),
    //     y: F64Wrapper(42.36809379745236),
    // });

    // let path = petgraph::algo::astar(
    //     &graph,
    //     *starting_point.unwrap(),
    //     |finish| finish == *ending_point.unwrap(),
    //     |e| *e.weight(),
    //     |_| 0.0,
    // );

    // let mut points = vec![];
    // if let Some((_, coordinate_path)) = path {
    //     for coordinate in coordinate_path {
    //         let point = match index_to_point_map.get(&coordinate) {
    //             Some(point) => point,
    //             None => {
    //                 eprintln!("THIS IS A BUG - INVESTIGATE IMMEDIATELY");
    //                 break;
    //             }
    //         };
    //         points.push(point);
    //     }
    // } else {
    //     println!("requested route does not exist with current data configuration");
    // }

    // let feature_collection: Vec<Value> = points
    //     .iter()
    //     .map(|point| {
    //         json!({
    //             "type": "Feature",
    //             "geometry": {
    //                 "coordinates": [point.x(), point.y()],
    //                 "type": "Point",
    //             },
    //             "properties": {}
    //         })
    //     })
    //     .collect();

    // let json = json!({
    //     "type": "FeatureCollection",
    //     "features": feature_collection
    // });

    // println!("{}", serde_json::to_string_pretty(&json).unwrap());
}

#[allow(dead_code)]
fn create_paths(
    graph: &mut petgraph::Graph<geo::Point, f64, Undirected>,
    sidewalks: &Vec<Walkable>,
    point_to_index_map: &mut std::collections::HashMap<HashablePoint, NodeIndex>,
    index_to_point_map: &mut std::collections::HashMap<NodeIndex, geo::Point>,
) {
    for sidewalk in sidewalks {
        let line_string = sidewalk.segments.clone();

        let mut prev: Option<NodeIndex> = None;
        for point in line_string.points() {
            let hashable_point = HashablePoint {
                x: F64Wrapper(point.x()),
                y: F64Wrapper(point.y()),
            };

            let point_index = match point_to_index_map.get(&hashable_point) {
                Some(&index) => index,
                None => {
                    let new_index = graph.add_node(point);
                    point_to_index_map.insert(hashable_point, new_index);
                    new_index
                }
            };

            let _ = match index_to_point_map.get(&point_index) {
                Some(_) => (),
                None => {
                    index_to_point_map.insert(point_index, point);
                }
            };

            if let Some(prev_index) = prev {
                graph.add_edge(prev_index, point_index, INTERNAL_SIDEWALK_EDGE_WEIGHT);
            }

            prev = Some(point_index);
        }
    }
}

#[allow(dead_code)]
fn load_segment_points(sidewalks: &Vec<Walkable>) -> RTree<geo::Point> {
    let mut points = vec![];

    for sidewalk in sidewalks {
        for line in sidewalk.segments.lines() {
            let (start, end) = line.points();
            points.extend([start, end]);
        }
    }

    RTree::bulk_load(points)
}

#[allow(dead_code)]
fn create_walkable_map(sidewalks: &Vec<Walkable>) -> HashMap<Uuid, Walkable> {
    let mut map = HashMap::new();

    for sidewalk in sidewalks {
        let id = sidewalk.id.unwrap();
        map.insert(id, sidewalk.clone());
    }

    map
}

/*
    iter through intersection points
        - for each intersection point, go through the intersecting IDs
        - find the street corresponding to that ID
        - find the point that is the same in that street (through the hashmap)
        - create an edge.
        - update the other hashmap for pathfinding result
*/
fn connect_intersections(
    graph: &mut petgraph::Graph<geo::Point, f64, Undirected>,
    sidewalks: &Vec<Walkable>,
    point_to_index_map: &mut std::collections::HashMap<HashablePoint, NodeIndex>,
    walkable_map: &HashMap<Uuid, Walkable>,
) {
    for sidewalk in sidewalks {
        let intersection_points = sidewalk.intersection_points.clone();

        for intersection_point in intersection_points {
            let intersecting_ids = intersection_point.intersecting_street_ids.clone();

            for intersecting_id in intersecting_ids {
                if intersecting_id == sidewalk.id.unwrap() {
                    continue;
                }

                let intersecting_sidewalk = match walkable_map.get(&intersecting_id) {
                    Some(sidewalk) => sidewalk,
                    None => {
                        eprintln!("QUERIED A SIDEWALK WITH NO ID - THIS IS MOST LIKELY A BUG");
                        continue;
                    }
                };

                let intersecting_sidewalk_point = match find_point(
                    &intersecting_sidewalk,
                    &intersection_point.intersection_point,
                ) {
                    Some(point) => point,
                    None => {
                        panic!("INTERSECTION POINT THAT WAS SUPPSOED TO BE FOUND WAS NOT FOUND - THIS IS MOST LIKELY A BUG");
                    }
                };

                let intersecting_sidewalk_hashable_point = HashablePoint {
                    x: F64Wrapper(intersecting_sidewalk_point.x()),
                    y: F64Wrapper(intersecting_sidewalk_point.y()),
                };

                let intersecting_sidewalk_index_point = match point_to_index_map
                    .get(&intersecting_sidewalk_hashable_point)
                {
                    Some(index) => *index,
                    None => {
                        panic!("INTERSECTION INDEX WAS NOT FOUND IN POINT TO INDEX MAP -> THIS SHOULD HAVE BEEN INSERTED INTO THE MAP EARLIER")
                    }
                };

                let intersecting_hashable_point = HashablePoint {
                    x: F64Wrapper(intersection_point.intersection_point.x()),
                    y: F64Wrapper(intersection_point.intersection_point.y()),
                };

                let intersecting_index_point = match point_to_index_map
                    .get(&intersecting_hashable_point)
                {
                    Some(index) => *index,
                    None => {
                        panic!("INTERSECTION INDEX WAS NOT FOUND IN POINT TO INDEX MAP -> THIS SHOULD HAVE BEEN INSERTED INTO THE MAP EARLIER")
                    }
                };

                let rating = assign_rating(intersecting_sidewalk);

                if graph.contains_edge(intersecting_index_point, intersecting_sidewalk_index_point)
                {
                    continue;
                } else {
                    graph.add_edge(
                        intersecting_index_point,
                        intersecting_sidewalk_index_point,
                        rating,
                    );
                }
            }
        }
    }
}

fn assign_rating(intersecting_sidewalk: &Walkable) -> f64 {
    const DEFAULT_SCORE: f64 = 1.0;
    const MAX_SCORE: f64 = 10.0;
    const SCALING_FACTOR: f64 = 60.0;
    const MULTIPLYER: usize = 2;

    if intersecting_sidewalk.lights.len() == 0 {
        return DEFAULT_SCORE;
    }

    /* a simple formula for determining edge weights -> capped at a max score of 10 */
    let raw_rating = (0 + (intersecting_sidewalk.lights.len() * MULTIPLYER)) as f64;
    let rating = (raw_rating / SCALING_FACTOR).round();

    if rating > MAX_SCORE {
        return MAX_SCORE;
    } else {
        return rating;
    }
}

fn is_point_equivalent(point1: &geo::Point, point2: &geo::Point) -> bool {
    point1.x() == point2.x() && point1.y() == point2.y()
}

fn find_point(sidewalk: &Walkable, inter_point: &geo::Point) -> Option<geo::Point> {
    for point in sidewalk.segments.clone().points() {
        if is_point_equivalent(&point, &inter_point) {
            return Some(point);
        }
    }

    None
}
