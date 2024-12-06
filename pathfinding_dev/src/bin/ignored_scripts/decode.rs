use flate2::read::GzDecoder;
use std::fs::File;
use std::io::{self, Read, Write};

fn decompress_gzip(input_path: &str, output_path: &str) -> io::Result<()> {
    // Open the input file (compressed)
    let file = File::open(input_path)?;
    let mut decoder = GzDecoder::new(file);

    // Open the output file (decompressed)
    let mut output = File::create(output_path)?;

    // Decompress the data
    io::copy(&mut decoder, &mut output)?;

    Ok(())
}

fn main() -> io::Result<()> {
    let input_path = "output.json.gz";
    let output_path = "decoded.json";

    decompress_gzip(input_path, output_path)?;

    println!("Decompression complete!");

    Ok(())
}
