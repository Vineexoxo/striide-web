#!/usr/bin/env bash

### still under development - do not use!

echo "running the create bounding polygon script" 
cargo run --release --bin make_polygon -- /nav_files/light_points.geojson > polygon_test.json
RETURN_CODE=$?
echo "return code of running intersection logic: $RETURN_CODE - check file bounding_polygon.json"

run_command() {
    script_cmd = $1
    description = $2 
    resulting_file = $3 
    script_name = $4

    echo "running script: $script_name" 
    script_cmd
    RETURN_CODE=$?

    if [ $RETURN_CODE -eq 0 ]; then echo "$script_name return code: $RETURN_CODE - check file bounding_polygon.json" 
    else echo "$script_name return code: $RETURN_CODE - something went wrong. See terminal for diagnostics." 
}