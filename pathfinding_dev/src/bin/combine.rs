mod format_information;
mod load;
mod utils;

use format_information::format_json::format_walkable_to_geojson;
use load::updated_load::get_features;
use utils::utility_fns::{open_file, get_base_dir}; 
use std::env; 

const SIDEWALKS_DATA_SET: usize = 1;
const CORRECT_NUM_PARAMS: usize = 3;
const PROJECTED_SIDEWALKS_DATA: usize = 2;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() != CORRECT_NUM_PARAMS {
        panic!("usage: cargo run [--release] --bin combine -- path_to_sidewalk_data_set");
    }

    let sidewalks_file_path = get_base_dir() + "/" + &args[SIDEWALKS_DATA_SET];
    let sidewalks_file_contents = match open_file(&sidewalks_file_path) {
        Ok(file) => file,
        Err(err) => panic!("Could not open file with error: {}", err),
    };

    let projected_data_path = get_base_dir() + "/" + &args[PROJECTED_SIDEWALKS_DATA];
    let projected_contents = match open_file(&projected_data_path) {
        Ok(file) => file,
        Err(err) => panic!("Could not open file with error: {}", err),
    };

    let sidewalks = get_features(&sidewalks_file_contents);
    let projected_sidewalks = get_features(&projected_contents); 

    let mut combined_info = vec![]; 

    for sidewalk in sidewalks {
        combined_info.push(sidewalk); 
    }
    
    for sidewalk in projected_sidewalks {
        combined_info.push(sidewalk); 
    }

    let json = format_walkable_to_geojson(&combined_info); 

    println!("{json}"); 
}