pub mod types {

    use std::hash::Hasher;

    use geo::{LineString, Point};
    use uuid::Uuid;

    #[derive(Debug, Clone)]
    #[allow(dead_code)]
    pub struct Walkable {
        pub id: Option<Uuid>,
        pub segments: LineString,
        pub lights: Vec<Point>,
        pub intersection_points: Vec<IntersectionPoint>,
    }
    
    #[derive(Debug, Clone)]
    #[allow(dead_code)]
    pub struct Properties {
        left_sidewalk_width: u32, 
        right_sidewalk_width: u32, 
        street_length: u32
    }

    #[derive(Debug, Clone)]
    #[allow(dead_code)]
    pub struct IntersectionPoint {
        pub intersection_point: Point,
        pub intersecting_street_ids: Vec<Uuid>,
    }

    /*
     *  F64Wrapper: a generic wrapper for the f64 type.
     *  pattern   : decorator
     *  purpose   : Rust does not natively support hashing of f64 values
     *              due to the inexact nature of floating point values and comparing NaN values.
     *              Therefore, the hash is decided by the bit representation of the float value.
     */
    #[allow(dead_code)]
    #[derive(Debug)]
    pub struct F64Wrapper(pub f64);

    impl core::hash::Hash for F64Wrapper {
        fn hash<H: Hasher>(&self, state: &mut H) {
            self.0.to_bits().hash(state)
        }
    }

    impl Eq for F64Wrapper {}

    impl PartialEq for F64Wrapper {
        fn eq(&self, other: &Self) -> bool {
            self.0.to_bits() == other.0.to_bits()
        }
    }

    /*
     *  HashablePoint: struct that contains the x and y coordinates of a light pole
     *  pattern      : decorator
     *  purpose      : with the way that the code is written, multiple points could be considered near
     *                 the part of the street that is querying the spatial r-tree. Therefore, a HashSet
     *                 is used to avoid duplicates.
     */
    #[derive(Eq, Hash, Debug)]
    #[allow(dead_code)]
    pub struct HashablePoint {
        pub x: F64Wrapper,
        pub y: F64Wrapper,
    }

    impl PartialEq for HashablePoint {
        fn eq(&self, other: &Self) -> bool {
            self.x.0.to_bits() == other.x.0.to_bits() && self.y.0.to_bits() == other.y.0.to_bits()
        }
    }
}

#[allow(dead_code)]
pub mod updated_load {
    use geo::{coord, point, Coord, LineString, MultiPolygon, Polygon};
    use rocket::serde::{de::value::MapDeserializer, Deserialize};
    use serde_json::{Map, Value};
    use std::collections::HashMap;

    use super::types::{IntersectionPoint, Walkable};

    fn load_coords(coord: &Value) -> geo::Coord {
        let curr_pair = coord.as_array().unwrap();
        let lon = curr_pair[0].as_f64().expect("expected lon to be a float");
        let lat = curr_pair[1].as_f64().expect("expected lat to be a float");

        geo::coord! {x: lon, y: lat}
    }

    fn load_points(point: &Value) -> geo::Point {
        let curr_pair = point.as_array().unwrap();

        let lon = curr_pair[0].as_f64().expect("expected lon to be a float");
        let lat = curr_pair[1].as_f64().expect("expected lat to be a float");
        geo::point! {x: lon, y: lat}
    }

    fn get_geojson_contents(content: Map<String, Value>) -> Vec<Value> {
        /* get only the features part of geojson, ignores all other fields */
        let (_, features): (&String, &Value) = content.iter().map(|obj| obj).nth(0).unwrap();
        assert!(features.is_array());
        features.as_array().unwrap().clone()
    }

    fn collect_points(
        sidewalk_map: &Map<String, Value>,
        property_name: &str,
    ) -> Option<Vec<geo::Point>> {
        let points = match sidewalk_map["properties"][property_name].as_array() {
            Some(points) => points.iter().map(load_points).collect(),
            None => return None,
        };

        Some(points)
    }

    pub fn get_features(data: &str) -> Vec<Walkable> {
        let data: HashMap<&str, Value> = match serde_json::from_str(data) {
            Ok(data) => data,
            Err(err) => panic!("could not parse JSON with error: {}", err),
        };

        let sidewalks_geojson = Map::deserialize(MapDeserializer::new(data.into_iter())).unwrap();
        let sidewalk_values = get_geojson_contents(sidewalks_geojson);

        let mut sidewalks = vec![];

        for value in sidewalk_values {
            let sidewalk_map: Map<String, Value> = serde_json::from_value(value.clone()).unwrap();
            let linestring_coords = sidewalk_map["geometry"]["coordinates"].as_array().unwrap();

            let coord_points: Vec<geo::Coord<f64>> =
                linestring_coords.iter().map(load_coords).collect();

            let intersection_points = match sidewalk_map["properties"]["intersection points"]
                .as_array()
            {
                Some(points) => points
                    .iter()
                    .map(|val| {
                        let val_map = val.as_object().unwrap();
                        let point = load_points(&val_map["point_coordinates"]);

                        // todo! figure out whether or not to keep this check as unwrap or not
                        let intersecting_street_ids = val_map["intersecting_street_ids"]
                            .as_array()
                            .unwrap()
                            .iter()
                            .map(|id| uuid::Uuid::parse_str(id.as_str().unwrap()).unwrap())
                            .collect();

                        IntersectionPoint {
                            intersection_point: point,
                            intersecting_street_ids: intersecting_street_ids,
                        }
                    })
                    .collect(),
                None => {
                    // eprintln!("THERE WERE NO INTERSECTION POINTS FOUND (i.e property with name intersection points was none) - MAKE SURE THIS IS INTENTATIONAL");
                    vec![]
                }
            };

            let light_points = match collect_points(&sidewalk_map, "lights") {
                Some(points) => points,
                None => {
                    // eprintln!("THERE WERE NO LIGHT POINTS FOUND (i.e property with name lights was none) - MAKE SURE THIS IS INTENTIONAL");
                    vec![]
                }
            };

            let id_string: Option<uuid::Uuid> = match sidewalk_map["properties"]["id"].as_str() {
                Some(id) => {
                    if id != "NONE" {
                        Some(uuid::Uuid::parse_str(id).unwrap())
                    } else {
                        None
                    }
                },
                None => {
                    // eprintln!("THERE WAS NO ID ASSIGNED (i.e property with name id was none) - MAKE SURE THIS IS INTENTIONAL");
                    None
                }
            };

            let curr_sidewalk = Walkable {
                id: id_string,
                segments: LineString::new(coord_points),
                lights: light_points,
                intersection_points: intersection_points,
            };

            sidewalks.push(curr_sidewalk);
        }

        sidewalks
    }

    pub fn get_walkable_features(data: &str) -> Vec<Walkable> {
        let data: HashMap<&str, Value> = match serde_json::from_str(data) {
            Ok(data) => data,
            Err(err) => panic!("could not parse JSON with error: {}", err),
        };

        let walkables_geo_json = Map::deserialize(MapDeserializer::new(data.into_iter())).unwrap();

        let walkable_values = get_geojson_contents(walkables_geo_json);
        let mut walkables = vec![];

        for value in walkable_values {
            let sidewalk_map: Map<String, Value> = serde_json::from_value(value.clone()).unwrap();
            let linestring_coords = sidewalk_map["geometry"]["coordinates"].as_array().unwrap();

            let coord_points: Vec<geo::Coord<f64>> =
                linestring_coords.iter().map(load_coords).collect();

            let light_points: Vec<geo::Point> = sidewalk_map["properties"]["lights"]
                .as_array()
                .unwrap()
                .iter()
                .map(load_points)
                .collect();

            let id_string = sidewalk_map["properties"]["id"].as_str().unwrap();

            let intersection_points = sidewalk_map["properties"]["intersection points"]
                .as_array()
                .unwrap()
                .iter()
                .map(|val| -> IntersectionPoint {
                    let val_map = val.as_object().unwrap();
                    let point = load_points(&val_map["point_coordinates"]);

                    let intersecting_street_ids = val_map["intersecting_street_ids"]
                        .as_array()
                        .unwrap()
                        .iter()
                        .map(|id| uuid::Uuid::parse_str(id.as_str().unwrap()).unwrap())
                        .collect();

                    IntersectionPoint {
                        intersection_point: point,
                        intersecting_street_ids: intersecting_street_ids,
                    }
                })
                .collect();

            let curr_sidewalk = Walkable {
                id: if sidewalk_map["properties"]["id"].as_str().unwrap() == "NONE" {
                    None
                } else {
                    Some(uuid::Uuid::parse_str(id_string).unwrap())
                },
                segments: LineString::new(coord_points),
                lights: light_points,
                intersection_points: intersection_points,
            };

            walkables.push(curr_sidewalk);
        }

        walkables
    }

    // pub fn format_street_vec_to_geojson(sidewalks: &Vec<StreetIntersection>) -> String {
    //     let mut map: Map<String, Value> = Map::new();
    //     let mut feature_collection = vec![];

    //     map.insert("type".into(), Value::String("FeatureCollection".to_owned()));
    //     map.insert("type".into(), Value::String("FeatureCollection".to_owned()));

    //     for sidewalk in sidewalks {
    //         feature_collection.push(format_feature(&sidewalk));
    //     }

    //     map.insert(
    //         "features".into(),
    //         serde_json::Value::Array(feature_collection),
    //     );

    //     serde_json::to_string_pretty(&map).unwrap()
    // }

    // fn format_feature(sidewalk: &StreetIntersection) -> Value {
    //     json!({
    //         "type": "Feature",
    //         "geometry": {
    //             "type": "LineString",
    //             "coordinates": sidewalk.segments.0.iter().map(|point| [point.y, point.x]).collect::<Vec<_>>()
    //         },
    //         "properties": {
    //             "intersection points": sidewalk.intersection_points.iter().map(|point| [point.y(), point.x()]).collect::<Vec<_>>(),
    //             "lights": sidewalk.lights.iter().map(|point| [point.y(), point.x()]).collect::<Vec<_>>(),
    //             "id": sidewalk.id.as_ref().map_or("NONE".to_string(), |id| id.to_string())
    //         }
    //     })
    // }

    pub fn load_lights(file_contents: &str) -> Vec<geo::Coord<f64>> {
        let json: serde_json::Value = serde_json::from_str(&file_contents)
            .expect("light JSON - expected JSON, input was not well formatted");

        let lights = json["transformed_coordinates"].as_array().unwrap();

        let light_coordinates: Vec<geo::Coord<f64>> = lights
            .iter()
            .map(|coord| {
                let lat = coord[0].as_f64().expect("expected lon to be a float");
                let lon = coord[1].as_f64().expect("expected lat to be a float");

                geo::coord! { x: lon, y: lat }
            })
            .collect();

        light_coordinates
    }

    pub fn load_lights_geojson(file_contents: &str) -> Vec<geo::Point> {
        let json: HashMap<&str, Value> = match serde_json::from_str(file_contents) {
            Ok(data) => data,
            Err(err) => panic!("could not parse JSON with error: {}", err),
        };
        let light_contents = Map::deserialize(MapDeserializer::new(json.into_iter())).unwrap();
        let light_values = get_geojson_contents(light_contents);

        let lights = light_values
            .iter()
            .map(|coords| {
                let point = coords["geometry"]["coordinates"].as_array().unwrap();

                geo::Point::new(
                    point[0].as_f64().expect("expected lon to be a float"),
                    point[1].as_f64().expect("expected lat to be a float"),
                )
            })
            .collect();
        lights
    }

    fn get_all_coordinates_from_value(value: &serde_json::Value) -> Vec<Coord<f64>> {
        let mut coordinates = Vec::new();
        if let Some(coords) = value
            .pointer("/geometry/coordinates")
            .and_then(|v| v.as_array())
        {
            for line in coords {
                if let Some(line_coords) = line.as_array() {
                    for coord in line_coords {
                        if let Some(coord_array) = coord.as_array() {
                            if coord_array.len() >= 2 {
                                let x = coord_array[0].as_f64().unwrap_or(0.0);
                                let y = coord_array[1].as_f64().unwrap_or(0.0);
                                coordinates.push(coord! { x: x, y: y });
                            }
                        }
                    }
                }
            }
        }
        coordinates
    }

    pub fn load_streets_json(data: &str) -> Vec<Walkable> {
        let mut streets: Vec<Walkable> = vec![];

        let json: serde_json::Value =
            serde_json::from_str(data).expect("street JSON - JSON was not well formatted");

        let features = json["features"].as_array().unwrap();

        for feature in features.iter() {
            /* possibly null value for some reason in dataset */
            if feature["geometry"]["coordinates"].is_null() {
                continue;
            }

            let coordinates = feature["geometry"]["coordinates"]
                .as_array()
                .expect("Expected coordinates to be an array");

            let geom_type = feature["geometry"]["type"].as_str().unwrap();

            #[allow(unused_assignments)]
            let mut points: Vec<Coord<f64>> = vec![];

            if geom_type == "MultiLineString" {
                points = get_all_coordinates_from_value(feature);
            } else {
                points = coordinates
                    .iter()
                    .map(|coord| {
                        let curr_pair = coord.as_array().unwrap();
                        let lon = curr_pair[0].as_f64().expect("expected lon to be a float");
                        let lat = curr_pair[1].as_f64().expect("expected lat to be a float");

                        coord! {x: lon, y: lat}
                    })
                    .collect();
            }

            let curr_street = Walkable {
                id: None,
                segments: LineString::new(points),
                lights: vec![],
                intersection_points: vec![],
            };

            streets.push(curr_street);
        }
        streets
    }

    pub fn load_municipality(data: &str, name: &str) -> MultiPolygon {
        let json: serde_json::Value =
            serde_json::from_str(data).expect("street JSON - JSON was not well formatted");

        let features = match json["features"].as_array() {
            Some(value) => value,
            None => panic!("features array does not exist - option returned none"),
        };

        let mut mp = MultiPolygon(vec![]);

        let town_geojson: Vec<&Value> = features
            .iter()
            .filter(|feature| {
                let geojson_feature = feature
                    .as_object()
                    .expect("feature was not well formatted - expected a type object");

                geojson_feature["properties"]["TOWN"]
                    .as_str()
                    .expect("name was not well formatted - expected a string type")
                    == name
            })
            .collect();

        assert!(town_geojson.len() == 1);

        let coordinates = town_geojson[0]
            .as_object()
            .expect("town feature was not formtted correctly - this is a bug")["geometry"]
            ["coordinates"]
            .as_array()
            .expect("geometry coordinates array was not well formatted - this is a bug");

        for coord in coordinates {
            let curr_coords = coord.as_array().expect("current coordinate system was not well formatted"); 
            let curr_polygon = Polygon::new(
                LineString(
                    (curr_coords[0]
                        .as_array()
                        .expect("expected first coord set to be an array - exterior points were not well formatted"))
                            .iter().map(|coord| {
                            coord! {
                                x: coord[0].as_f64().expect("expected x coordinate to be a f64"), 
                                y: coord[1].as_f64().expect("expected y coordinate to be a f64")
                            }
                }).collect()), 
                vec![], 
            ); 
            mp.0.push(curr_polygon); 
        }

        mp
    }

    fn convert_multipolygon_to_linestring(mp: MultiPolygon) -> Vec<LineString<f64>> {
        let mut lines = vec![];
        for polygon in mp.0 {
            let exterior_points = polygon.exterior().clone();
            lines.push(exterior_points);
        }
        lines
    }

    pub fn load_building_coordinates(data: &str) -> Vec<geo::Point> {
        let json: serde_json::Value =
            serde_json::from_str(data).expect("street JSON - JSON was not well formatted");

        let coordinates = json["converted_coordinates"].as_array().expect("Could not find the value of key: converted_coordinates"); 

        let buildings = coordinates.iter().map(|coord| {
            let curr_pair = coord.as_array().unwrap();
            let lon = curr_pair[0].as_f64().expect("expected lon to be a float");
            let lat = curr_pair[1].as_f64().expect("expected lat to be a float");

            point! {x: lon, y: lat}
        }).collect(); 

        buildings
    }
}
