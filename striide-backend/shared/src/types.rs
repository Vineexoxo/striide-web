use std::hash::Hasher; 

/*
 *  F64Wrapper:    a generic wrapper for the f64 type.
 *  
 *  purpose   :    Rust does not natively support hashing of f64 values
 *                 due to the inexact nature of floating point values and inconsistency comparing NaN values.
 *                 Therefore, the hash is decided by the bit representation of the float value.
 *  
 *  justification: Since the floats are given as 64 bit floats, the actual probability of two floats 
 *                 being the same bit representation as another without necessarily being the same value 
 *                 is pretty low. 
 *  
 *                 No problems have been detected with this method. (so far...)
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

impl HashablePoint {
    pub fn new(x: f64, y: f64) -> Self {
        Self { x: F64Wrapper(x), y: F64Wrapper(y) }
    }
}
