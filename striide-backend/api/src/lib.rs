use std::{collections::HashMap, io::Read, path::Path};

use geo::Point;
use petgraph::{
    graph::{NodeIndex, UnGraph},
    Undirected,
};

use flate2::read::GzDecoder;
use rstar::RTree;
use serde_json::Value;

#[macro_use]
extern crate rocket;

mod auth;
mod business;
mod pathfinder;
mod user_reports;
mod feedback;
mod onboarding;

extern crate shared;
use crate::shared::types::{F64Wrapper, HashablePoint};

#[derive(Debug)]
pub struct NavGraph {
    pub graph: petgraph::Graph<geo::Point, f64, Undirected>,
    pub point_to_index_map: HashMap<HashablePoint, NodeIndex>,
    pub index_to_point_map: HashMap<NodeIndex, HashablePoint>,
    pub distance_tree: RTree<geo::Point>,
}

pub fn routes() -> Vec<rocket::Route> {
    routes![
        auth::login,
        auth::register,
        auth::refresh_access,
        auth::verify_session,
        auth::csrf_token,
        auth::landing,
        auth::check_session,
        business::open_businesses,
        pathfinder::query_route,
        pathfinder::test_routes,
        pathfinder::test_mapbox, 
        user_reports::upload_report,  
        user_reports::fetch_reports, 
        user_reports::fetch_report_draft, 
        user_reports::discard_draft, 
        user_reports::publish_draft, 
        user_reports::report_ids,
        user_reports::get_report,
        user_reports::report_likes,
        user_reports::like_report,
        feedback::submit_feedback,
        onboarding::onboarder,

    ]
}

pub fn load_graph() -> NavGraph {
    let graph_file_path = Path::new("./api/src/output.json.gz");

    let file = match std::fs::File::open(graph_file_path) {
        Ok(file) => file,
        Err(err) => panic!("Error opening compressed graph file: {}", err),
    };
    let mut decoder = GzDecoder::new(file);

    let mut decompressed_data = String::new();
    match decoder.read_to_string(&mut decompressed_data) {
        Ok(contents) => contents,
        Err(err) => panic!("Could not decode the file - with error: {}", err),
    };

    let mut graph: petgraph::Graph<geo::Point, f64, Undirected> = UnGraph::new_undirected();
    let mut point_to_index_map: HashMap<HashablePoint, NodeIndex> = HashMap::new();
    let mut index_to_point_map: HashMap<NodeIndex, HashablePoint> = HashMap::new();

    let graph_map: HashMap<&str, Value> = match serde_json::from_str(&decompressed_data) {
        Ok(data) => data,
        Err(err) => panic!("could not parse JSON with error: {}", err),
    };

    let nodes = graph_map["nodes"].as_array().unwrap();
    let edges = graph_map["edges"].as_array().unwrap();

    let mut points = vec![];

    for node in nodes {
        let graph_node = node.as_object().unwrap();
        let graph_point = Point::new(
            graph_node["x"].as_f64().unwrap(),
            graph_node["y"].as_f64().unwrap(),
        );

        // todo: figure this out
        let hashable_point = HashablePoint {
            x: F64Wrapper(graph_point.x()),
            y: F64Wrapper(graph_point.y()),
        };

        let hashable_point_copy = HashablePoint {
            x: F64Wrapper(graph_point.x()),
            y: F64Wrapper(graph_point.y()),
        };

        let node_index = graph.add_node(graph_point);
        point_to_index_map.insert(hashable_point, node_index);
        index_to_point_map.insert(node_index, hashable_point_copy);

        points.push(graph_point);
    }

    for edge in edges {
        let source_obj = edge[0].as_object().unwrap();
        let target_obj = edge[1].as_object().unwrap();
        let weight = edge[2].as_f64().unwrap();

        let source_hashable_point = HashablePoint {
            x: F64Wrapper(source_obj["x"].as_f64().unwrap()),
            y: F64Wrapper(source_obj["y"].as_f64().unwrap()),
        };

        let target_hashable_point = HashablePoint {
            x: F64Wrapper(target_obj["x"].as_f64().unwrap()),
            y: F64Wrapper(target_obj["y"].as_f64().unwrap()),
        };

        let source_index = match point_to_index_map.get(&source_hashable_point) {
            Some(point) => *point,
            None => panic!("SOURCE POINT SHOULD EXIST"),
        };

        let target_index = match point_to_index_map.get(&target_hashable_point) {
            Some(point) => *point,
            None => panic!("TARGET POINT SHOULD EXIST"),
        };

        graph.add_edge(source_index, target_index, weight);
    }

    NavGraph {
        graph: graph,
        point_to_index_map: point_to_index_map,
        index_to_point_map: index_to_point_map,
        distance_tree: RTree::bulk_load(points),
    }
}
