mod utils; 

use std::path::Path;
use std::fs; 

fn main() {

    let path = Path::new("./graph.json"); 

    let graph_contents = match fs::read_to_string(path) {
        Ok(contents) => contents, 
        Err(err) => panic!("Could not open file with path: {:#?} with error: {:?}", path, err), 
    }; 

    println!("{graph_contents}"); 
    
}