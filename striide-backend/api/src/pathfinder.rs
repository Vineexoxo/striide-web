/*
 * Internal Imports
 */
use models::user::UserRouteQuery; 
use shared::response_models::{ComputedPath, ErrorResponse, Response, ResponseBody}; 
use shared::types::HashablePoint; 
use crate::NavGraph;

/*
* External Imports
*/
use reqwest::Client;
use rocket::serde::Deserialize;
use rocket::{http::Status, serde::json::Json, State, serde::json::Value};
use geo::Point;
use serde_json::json;

/* 
 * constants 
 */
const CORRECT_COORDINATE_AMOUNT: usize = 2; 
const X_POSITION_INDICATOR: usize = 0;
const Y_POSITION_INDICATOR: usize = 1;

#[post("/query_route", data = "<request>")]
pub fn query_route(request: Json<UserRouteQuery>, navgraph: &State<NavGraph>) -> Result<Response, ErrorResponse> {

    let request = request.into_inner(); 
    if request.origin.len() != CORRECT_COORDINATE_AMOUNT {
        return Err(ErrorResponse {
            status: Status::BadRequest, 
            message: "origins array must only contain user's current longitude and latitude coordinates".to_owned(),  
        }) 
    }

    if request.destination.len() != CORRECT_COORDINATE_AMOUNT {
        return Err(ErrorResponse {
            status: Status::BadRequest, 
            message: "destinations array must only contain user's destination longitude and latitude coordinates".to_owned(), 
        }) 
    }
    // todo: figure out a way to handle the case where the user's origin coordinates are within bounding polygon (i.e. area of service) 
    // todo: or just figure that out on the frontend and verify on the backend. 
    let path = compute_path(&request.origin, &request.destination, navgraph)?; 
    // let mapbox_suggestion = get_shortest_mapbox_suggestion(&request.origin, &request.destination).await?; 

    Ok(Response {
        status: Status::Ok, 
        body: ResponseBody::ComputedPath(ComputedPath {
            striide_route: path, 
            mapbox_route: vec![], 
        })
    })
}

fn compute_path(origin: &Vec<f64>, destination: &Vec<f64>, navgraph: &State<NavGraph>) -> Result<Vec<(f64, f64)>, ErrorResponse> {
    let origin_x = origin[X_POSITION_INDICATOR];
    let origin_y = origin[Y_POSITION_INDICATOR]; 

    let destination_x = destination[X_POSITION_INDICATOR];
    let destination_y = destination[Y_POSITION_INDICATOR];

    let nearest_point_to_origin = navgraph.distance_tree.nearest_neighbor(&Point::new(origin_x, origin_y)).unwrap(); 
    let nearest_point_to_destination = navgraph.distance_tree.nearest_neighbor(&Point::new(destination_x, destination_y)).unwrap();

    let nearest_origin_hashable = HashablePoint::new(nearest_point_to_origin.x(), nearest_point_to_origin.y());
    let nearest_destination_hashable = HashablePoint::new(nearest_point_to_destination.x(), nearest_point_to_destination.y());

    let origin_node_index: Result<_, ErrorResponse> = match navgraph.point_to_index_map.get(&nearest_origin_hashable) {
        Some(index) => Ok(index), 
        None => return Err(ErrorResponse {
            status: Status::BadRequest, 
            message: "bad origin point request - coordinates are not found".to_owned()
        })
    }; 

    let destination_node_index: Result<_, ErrorResponse> = match navgraph.point_to_index_map.get(&nearest_destination_hashable) {
        Some(index) => Ok(index), 
        None => return Err(ErrorResponse {
            status: Status::BadRequest, 
            message: "bad origin point request - coordinates are not found".to_owned()
        })
    }; 

    let path = petgraph::algo::astar(
        &navgraph.graph,
        *origin_node_index.unwrap(),
        |finish| finish == **destination_node_index.as_ref().unwrap(),
        |e| *e.weight(),
        |_| 0.0,
    );

    let mut points = vec![];
    if let Some((_, coordinate_path)) = path {
        for coordinate in coordinate_path {
            let point: Result<(f64, f64), ErrorResponse> = match navgraph.index_to_point_map.get(&coordinate) {
                Some(point) => Ok((point.x.0, point.y.0)),
                None => return Err(ErrorResponse {
                    status: Status::InternalServerError, 
                    message: "bad origin point request - coordinates are not found".to_owned()
                })
            };
            points.push(point.unwrap());
        }
    } else {
        println!("requested route does not exist with current data configuration");
    }
    
    Ok(points)
}

#[post("/test_routes", data = "<request>")]
pub fn test_routes(request: Json<UserRouteQuery>, navgraph: &State<NavGraph>) -> Result<Value, ErrorResponse> {
    let request = request.into_inner(); 
    let path = compute_path_v2(request.origin.clone(), request.destination.clone(), navgraph)?; 

    Ok(json!({
        "type": "FeatureCollection", 
        "features": [
            {
                "type": "Feature", 
                "geometry": {
                    "type": "LineString", 
                    "coordinates": path, 
                }, 
                "properties": {}
            }
        ]
    }))
}

fn compute_path_v2(origin: Vec<f64>, destination: Vec<f64>, navgraph: &State<NavGraph>) -> Result<Vec<(f64, f64)>, ErrorResponse> {
    let origin_x = origin[X_POSITION_INDICATOR];
    let origin_y = origin[Y_POSITION_INDICATOR]; 

    let destination_x = destination[X_POSITION_INDICATOR];
    let destination_y = destination[Y_POSITION_INDICATOR];

    let origin_point = Point::new(origin_x, origin_y); 
    let destination_point = Point::new(destination_x, destination_y); 

    let nearest_point_to_origin = navgraph.distance_tree.nearest_neighbor_iter(&origin_point).next().unwrap(); 
    let nearest_point_to_destination = navgraph.distance_tree.nearest_neighbor_iter(&destination_point).next().unwrap();

    let nearest_origin_hashable = HashablePoint::new(nearest_point_to_origin.x(), nearest_point_to_origin.y());
    let nearest_destination_hashable = HashablePoint::new(nearest_point_to_destination.x(), nearest_point_to_destination.y());

    let origin_node_index: Result<_, ErrorResponse> = match navgraph.point_to_index_map.get(&nearest_origin_hashable) {
        Some(index) => Ok(index), 
        None => return Err(ErrorResponse {
            status: Status::BadRequest, 
            message: "bad origin point request - coordinates are not found".to_owned()
        })
    }; 

    let destination_node_index: Result<_, ErrorResponse> = match navgraph.point_to_index_map.get(&nearest_destination_hashable) {
        Some(index) => Ok(index), 
        None => return Err(ErrorResponse {
            status: Status::BadRequest, 
            message: "bad origin point request - coordinates are not found".to_owned()
        })
    }; 

    let path = petgraph::algo::astar(
        &navgraph.graph,
        *origin_node_index.unwrap(),
        |finish| finish == **destination_node_index.as_ref().unwrap(),
        |e| *e.weight(),
        |_| 0.0,
    );

    let mut points = vec![];
    if let Some((_, coordinate_path)) = path {
        for coordinate in coordinate_path {
            let point: Result<(f64, f64), ErrorResponse> = match navgraph.index_to_point_map.get(&coordinate) {
                Some(point) => Ok((point.x.0, point.y.0)),
                None => return Err(ErrorResponse {
                    status: Status::InternalServerError, 
                    message: "bad origin point request - coordinates are not found".to_owned()
                })
            };
            points.push(point.unwrap());
        }
    } else {
        println!("requested route does not exist with current data configuration");
    }
    
    Ok(points)
}

#[derive(Deserialize, Debug)]
#[serde(crate = "rocket::serde")]
struct DirectionsResponse {
    routes: Vec<Route>,
}

#[derive(Deserialize, Debug)]
#[serde(crate = "rocket::serde")]
struct Route {
    geometry: Geometry,
}

#[derive(Deserialize, Debug)]
#[serde(crate = "rocket::serde")]
struct Geometry {
    coordinates: Vec<Vec<f64>>,  
}

#[allow(dead_code)]
async fn get_shortest_mapbox_suggestion(origin: &Vec<f64>, destination: &Vec<f64>) -> Result<Vec<(f64, f64)>, ErrorResponse> {

    let origin_x = origin[X_POSITION_INDICATOR];
    let origin_y = origin[Y_POSITION_INDICATOR]; 

    let destination_x = destination[X_POSITION_INDICATOR];
    let destination_y = destination[Y_POSITION_INDICATOR];

    // let mapbox_public_token = match std::env::var("MAPBOX_ACCESS_TOKEN") {
    //     Ok(token) => token,
    //     Err(err) => return Err(ErrorResponse {
    //         status: Status::InternalServerError, 
    //         message: err.to_string()
    //     })
    // }; 

    let api_query =
        format!("https://api.mapbox.com/directions/v5/mapbox/walking/{}%2C{}%3B{}%2C{}?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1Ijoic3RyaWlkZSIsImEiOiJjbHN1dml6em0wM3E0MmxzMWVwMjNvNDBsIn0.aWXVdLx6iq3ZSSavUicsZA", origin_x, origin_y, destination_x, destination_y); 

    let client = Client::new();
    let res = client.get(&api_query).send().await.unwrap();

    if res.status().is_success() {
        let directions: DirectionsResponse = res.json().await.unwrap();

        if let Some(route) = directions.routes.first() {
            return Ok(route.geometry.coordinates.iter().map(|coord| (coord[0], coord[1])).collect()); 
        } else {
            return Err(ErrorResponse {
                status: Status::NotFound, 
                message: "NO ROUTES EXIST".to_owned()
            })
        }
    } else {
        return Err(ErrorResponse {
            status: Status::NotFound, 
            message: "DIRECTIONS ARE NOT POSSIBLE WITH GIVEN CONFIGURATION".to_owned()
        })
    }
}

#[post("/test_mapbox", data = "<request>")]
pub async fn test_mapbox(request: Json<UserRouteQuery>) -> Result<Value, ErrorResponse> {
    dotenv::dotenv().ok(); 

    let request = request.into_inner(); 

    let origin_x = request.origin[X_POSITION_INDICATOR];
    let origin_y = request.origin[Y_POSITION_INDICATOR]; 

    let destination_x = request.destination[X_POSITION_INDICATOR];
    let destination_y = request.destination[Y_POSITION_INDICATOR];

    let mapbox_public_token = match std::env::var("MAPBOX_ACCESS_TOKEN") {
        Ok(token) => token,
        Err(err) => return Err(ErrorResponse {
            status: Status::InternalServerError, 
            message: err.to_string()
        })
    }; 

    let api_query =
        format!("https://api.mapbox.com/directions/v5/mapbox/walking/{}%2C{}%3B{}%2C{}?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token={}", origin_x, origin_y, destination_x, destination_y, mapbox_public_token); 

    let client = Client::new();
    let res = client.get(&api_query).send().await.unwrap();

    if res.status().is_success() {
        let directions: DirectionsResponse = res.json().await.unwrap();

        if let Some(route) = directions.routes.first() {

            let coordinates: Vec<(f64, f64)> = route.geometry.coordinates.iter().map(|coord| (coord[0], coord[1])).collect();  

            return Ok(json!({
                "type": "FeatureCollection", 
                "features": [
                    {
                        "type": "Feature", 
                        "geometry": {
                            "type": "LineString", 
                            "coordinates": coordinates, 
                        }, 
                        "properties": {}
                    }
                ]
            }))
        } else {
            return Err(ErrorResponse {
                status: Status::NotFound, 
                message: "NO ROUTES EXIST".to_owned()
            })
        }
    } else {
        return Err(ErrorResponse {
            status: Status::NotFound, 
            message: "DIRECTIONS ARE NOT POSSIBLE WITH GIVEN CONFIGURATION".to_owned()
        })
    }
}