#[allow(dead_code)]
pub mod calculate_nearest {
    use geo::{point, HaversineDistance, LineString, Point};
    use rstar::RTree;
    use std::collections::HashSet;
    use std::hash::{Hash, Hasher};

    /*
     *  F64Wrapper: a generic wrapper for the f64 type.
     *  pattern   : decorator
     *  purpose   : Rust does not natively support hashing of f64 values
     *              due to the inexact nature of floating point values and comparing NaN values.
     *              Therefore, the hash is decided by the bit representation of the float value.
     */
    struct F64Wrapper(f64);

    impl Hash for F64Wrapper {
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
    #[derive(Eq, Hash)]
    struct HashablePoint {
        x: F64Wrapper,
        y: F64Wrapper,
    }

    impl PartialEq for HashablePoint {
        fn eq(&self, other: &Self) -> bool {
            self.x.0.to_bits() == other.x.0.to_bits() && self.y.0.to_bits() == other.y.0.to_bits()
        }
    }

    pub fn get_mid_point(start: Point, end: Point) -> Point {
        const DEG_TO_RADS: f64 = std::f64::consts::PI / 180.0;
        const RADS_TO_DEGS: f64 = 180.0 / std::f64::consts::PI;
        const TOTAL_WEIGHT: u8 = 2;

        let start_lon_rads = start.x() * DEG_TO_RADS;
        let start_lat_rads = start.y() * DEG_TO_RADS;

        let end_lon_rads = end.x() * DEG_TO_RADS;
        let end_lat_rads = end.y() * DEG_TO_RADS;

        let (start_x, start_y, start_z) = (
            f64::cos(start_lat_rads) * f64::cos(start_lon_rads),
            f64::cos(start_lat_rads) * f64::sin(start_lon_rads),
            f64::sin(start_lat_rads),
        );

        let (end_x, end_y, end_z) = (
            f64::cos(end_lat_rads) * f64::cos(end_lon_rads),
            f64::cos(end_lat_rads) * f64::sin(end_lon_rads),
            f64::sin(end_lat_rads),
        );

        let (x, y, z) = (
            (start_x + end_x) / TOTAL_WEIGHT as f64,
            (start_y + end_y) / TOTAL_WEIGHT as f64,
            (start_z + end_z) / TOTAL_WEIGHT as f64,
        );

        let mid_lon_rads = y.atan2(x);
        let hyp = f64::sqrt((x * x) + (y * y));
        let mid_lat_rads = z.atan2(hyp);

        let mid_lat = mid_lat_rads * RADS_TO_DEGS;
        let mid_lon = mid_lon_rads * RADS_TO_DEGS;

        point! {x: mid_lon, y: mid_lat}
    }

    // pub fn get_k_nearest_neighbors(
    //     k: u32,
    //     street: &LineString,
    //     spatial_tree: &RTree<Point>,
    // ) -> Vec<Vec<Point>> {
    //     let mut neighbors: Vec<Vec<Point>> = vec![];
    //     let mut seen_lights: HashSet<HashablePoint> = HashSet::new();

    //     for line in street.lines() {
    //         let (start, end) = line.points();

    //         let start_neighbors = compute_point(start, spatial_tree, k, &mut seen_lights);
    //         let end_neighbors = compute_point(end, spatial_tree, k, &mut seen_lights);

    //         neighbors.push(start_neighbors);
    //         neighbors.push(end_neighbors); 
    //     }
    //     neighbors
    // }
    // fn compute_point(
    //     point: Point,
    //     spatial_tree: &RTree<Point>,
    //     k: u32,
    //     seen_lights: &mut HashSet<HashablePoint>,
    // ) -> Vec<Point> {
    //     let mut curr_neighbors = vec![]; 
    //     const DIST_THRESHOLD: f64 = 0.000000012949080002809418;
    //     let point_nearest_neighbors = spatial_tree
    //         .nearest_neighbor_iter_with_distance_2(&point)
    //         .collect::<Vec<_>>();

    //     for i in 0..std::cmp::min(k, point_nearest_neighbors.len() as u32) {
    //         let curr_point = *(point_nearest_neighbors.get(i as usize).unwrap().0);
    //         let point_distance = point_nearest_neighbors.get(i as usize).unwrap().1;

    //         if point_distance <= DIST_THRESHOLD * 2.0 {
    //             let hashable_point = HashablePoint {
    //                 x: F64Wrapper(curr_point.x()),
    //                 y: F64Wrapper(curr_point.y()),
    //             };

    //             if !seen_lights.contains(&hashable_point) {
    //                 curr_neighbors.push(curr_point);
    //                 seen_lights.insert(hashable_point);
    //             }
    //         }
    //     }

    //     curr_neighbors
    // }

    pub fn get_k_nearest_neighbors(
        k: u32,
        street: &LineString,
        spatial_tree: &RTree<Point>,
    ) -> Vec<Vec<Point>> {
        let mut neighbors: Vec<Vec<Point>> = vec![];
        let mut seen_lights: HashSet<HashablePoint> = HashSet::new();

        const DIST_THRESHOLD: f64 = 0.000000012949080002809418;
        const LENGTH_THRESHOLD: f64 = 15.0;
        const INTERVAL_FACTOR: f64 = 5.0;

        for line in street.lines() {
            let start_point = point! {x: line.start.x, y: line.start.y};
            let end_point = point! {x: line.end.x, y: line.end.y};
            let total_distance = start_point.haversine_distance(&end_point);

            let mut all_points: Vec<Point> = vec![start_point, end_point];

            if total_distance > LENGTH_THRESHOLD {
                let intervals: usize = (total_distance / INTERVAL_FACTOR).ceil() as usize;

                let mut start_bound = start_point;
                let mut end_bound = end_point;

                for _ in 0..intervals / 2 {
                    let curr_mid_point = get_mid_point(start_point, end_bound);
                    all_points.push(curr_mid_point);
                    end_bound = curr_mid_point;
                }

                for _ in (intervals / 2 + 1)..intervals {
                    let curr_mid_point = get_mid_point(start_bound, end_point);
                    all_points.push(curr_mid_point);
                    start_bound = curr_mid_point;
                }
            }

            for point in all_points.iter() {
                let mut curr_neighbors: Vec<Point> = vec![];

                let point_nearest_neighbors = spatial_tree
                    .nearest_neighbor_iter_with_distance_2(&point)
                    .collect::<Vec<_>>();

                for i in 0..std::cmp::min(k, point_nearest_neighbors.len() as u32) {
                    let curr_point = *(point_nearest_neighbors.get(i as usize).unwrap().0);
                    let point_distance = point_nearest_neighbors.get(i as usize).unwrap().1;

                    // println!("{}", point_distance);

                    if point_distance <= DIST_THRESHOLD * 2.0 {
                        let hashable_point = HashablePoint {
                            x: F64Wrapper(curr_point.x()),
                            y: F64Wrapper(curr_point.y()),
                        };

                        if !seen_lights.contains(&hashable_point) {
                            curr_neighbors.push(curr_point);
                            seen_lights.insert(hashable_point);
                        }
                    }
                }
                neighbors.push(curr_neighbors);
            }
        }
        neighbors
    }
}
