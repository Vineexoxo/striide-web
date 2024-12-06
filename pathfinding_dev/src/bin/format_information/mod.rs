#[allow(dead_code)]
pub mod format_json {
    use crate::load::types::Walkable;
    use serde_json::{json, Map, Value};
    use rand::Rng; 

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

    /*
        !! for some reason, the point itself gets returned in reverse order. It may look like a bug
        !! but IT IS NOT A BUG !!!!!!
    */
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

    pub fn format_walkable_to_geojson(walkables: &Vec<Walkable>) -> String {
        let mut map: Map<String, Value> = Map::new();
        let mut feature_collection = vec![];

        map.insert("type".into(), Value::String("FeatureCollection".to_owned()));
        map.insert("type".into(), Value::String("FeatureCollection".to_owned()));

        for walkable in walkables {
            feature_collection.push(format_walkable_feature(&walkable));
        }

        map.insert(
            "features".into(),
            serde_json::Value::Array(feature_collection),
        );

        serde_json::to_string_pretty(&map).unwrap()
    }

    pub fn format_walkable_feature(walkable: &Walkable) -> Value {
        let intersection_points: Vec<Value> = walkable
            .intersection_points
            .iter()
            .map(|inter_point| -> Value {
                json!({    
                    "point_coordinates": [inter_point.intersection_point.x(), inter_point.intersection_point.y()], 
                    "intersecting_street_ids": inter_point.intersecting_street_ids.iter().map(|id| -> String {id.to_string()}).collect::<Vec<_>>()
                })
            })
            .collect();

        json!({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": walkable.segments.0.iter().map(|point| [point.x, point.y]).collect::<Vec<_>>()
            },
            "properties": {
                "intersection points": intersection_points,
                "lights": walkable.lights.iter().map(|point| [point.x(), point.y()]).collect::<Vec<_>>(),
                "id": walkable.id.as_ref().map_or("NONE".to_string(), |id| id.to_string()), 
                /* uncomment the bottom lines for color options for debugging */
                // "stroke": random_hex_color(),
                // "stroke-width": 2
            }
        })
    }

    pub fn format_points_only(points: Vec<geo::Point>) -> String {
        let features: Vec<Value> = points.iter().map(|point| {
            json!({
                "type": "Feature", 
                "geometry": {
                    "coordinates": [point.x(), point.y()],
                    "type": "Point", 
                }, 
                "properties": {}
            })
        }).collect(); 

        let json = json!({
            "type": "FeatureCollection", 
            "features": features
        }); 

        serde_json::to_string_pretty(&json).unwrap()
    }

    fn random_hex_color() -> String {
        let mut rng = rand::thread_rng();
        let color: u32 = rng.gen_range(0..=0xFFFFFF); // Generate a random 24-bit color
    
        format!("#{:06X}", color).to_ascii_lowercase() // Format as a six-digit hexadecimal string
    }

}
