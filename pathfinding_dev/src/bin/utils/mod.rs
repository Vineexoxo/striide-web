pub mod utility_fns {
    use std::fs::File;
    use std::io::prelude::*;

    pub fn open_file(pathname: &str) -> Result<String, std::io::Error> {
        let file = File::open(pathname);

        match file {
            Ok(mut file) => {
                let mut contents = String::new();
                file.read_to_string(&mut contents)?;
                Ok(contents)
            }
            Err(err) => return Err(err),
        }
    }

    pub fn get_base_dir() -> String {
        let base_path = match std::env::current_dir() {
            Ok(path) => path,
            Err(err) => panic!("Could not get base directory with error: {}", err),
        };

        base_path.to_str().unwrap().into()
    }
}
